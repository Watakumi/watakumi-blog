---
layout: post
title: 'View Componentのすすめ②'
author: [Watakumi]
tags: ['Ruby on Rails']
image: img/view_components/view_component2.jpg
date: '2021-06-11 01:29:37.121'
draft: false
excerpt: 前記事では、view_componentの導入方法とプレビュー機能の利用方法について説明しました。本記事では、実際にアプリケーションで使用する場合にどのようにview_componentを利用すると健全なコンポーネントになるのか私の見解を述べたいと思います。
---

[前記事](/view_component/)までの知識を前提としています。

## 準備

例として、次のようなカラムを持つ`Post`クラスを用意します。

```
title -> タイトル
description -> 概要
published_at -> 公開日時
```

```rb
Post(id: integer, title: string, description: string, published_at: datetime, created_at: datetime, updated_at: datetime)
```

### Component を作成する

次のコマンドを実行して Post の情報を表示する`PostComponent`を作成しましょう。

```
$ rails g component Post post --preview
Running via Spring preloader in process 117
      create  app/components/post_component.rb
      invoke  rspec
      create    spec/components/post_component_spec.rb
      invoke  preview
      create    lib/component_previews/post_component_preview.rb
      invoke  erb
      create    app/components/post_component.html.erb
```

```rb
# app/components/post_component.rb

class PostComponent < ViewComponent::Base
  def initialize(post:)
    @post = post
  end
end
```

view は次のように記述し、`title`, `description`, 公開されていれば`published_at`を表示するようにしてみましょう。

```
# app/components/post_component.html.erb
<div>
  <h1><%= @post.title %></h1>
  <h2><%= @post.description %></h2>
  <% if @post.published_at.present? %>
    <%= @post.published_at %>
  <% end %>
</div>
```

また、生成されたプレビューは次のように実装してみました。

```rb
# lib/component_previews/post_component.rb

class PostComponentPreview < ViewComponent::Preview
  def default
    post = Post.new(title: 'Default', description: 'default description')
    render(PostComponent.new(post: post))
  end
end
```

上記で引数として渡した`post`では`published_at`が`nil`になっています。
プレビューを表示して公開日時が表示されていないことを確認してみましょう。（確認方法は前の記事で紹介しています。）

次は公開日時が設定されている場合のプレビューを追加します。

```rb
# lib/component_previews/post_component.rb

class PostComponentPreview < ViewComponent::Preview
  # ...
  def published_post
    post = Post.new(title: 'Published post', description: 'This is published post', published_at: Time.current)
    render(PostComponent.new(post: post))
  end
end
```

この場合、`published_at`を持つ post が引数で与えられているので、Component の view で公開日時が表示されるようになりました。

## 拡張性について考える

上記あげた例のように単純な Component で良いのならば特に問題はないと思います。
ただ、現実のアプリケーションでは様々ニーズに合わせて機能を拡張する必要があります。
<br/>
このアプリケーションを使用するユーザーから次のような要望がありました。
`公開日時が現在時刻よりも先の場合にのみ表示するようにしてほしいのですけど…`
このような要望は即 OK レベルだと思います。
さて Component に条件を追加していきましょう。

```
# app/components/post_component.html.erb

<div>
  <h1><%= @post.title %></h1>
  <h2><%= @post.description %></h2>
  <% if @post.published_at.present? && @post.published_at > Time.current %>
    <%= @post.published_at %>
  <% end %>
</div>
```

さて、これで要望通りに実装することができました。
しかし、触れておきたいことがあります。

`if @post.published_at.present? && @post.published_at > Time.current`

これは view のロジックとしてまだまだ許容範囲ではありますが、今後さらに表示の条件が加わった場合にかなり汚れた view になってしまうことは想像しやすいと思います。
この他にも、
<br/>
`titleの長さが8文字を越えたら改行してほしい`
<br/>
なども加わると可読性が落ちていきますね。(あぁ、嫌だ…)

### 可読性を維持するためのポイント

1. view にロジックをベタ書きしない

`@post.published_at.present? && @post.published_at > Time.current`
このような条件はすぐに Component の Class にメソッドを用意しましょう。

```rb
# app/components/post_component.rb

class PostComponent < ViewComponent::Base
  def initialize(post:)
    @post = post
  end

  private

  def display_published_at?
    @post.published_at.present? && @post.published_at > Time.current
  end
end
```

```
# app/components/post_component.html.erb

<div>
  <h1><%= @post.title %></h1>
  <h2><%= @post.description %></h2>
  <% if display_published_at? %>
    <%= @post.published_at %>
  <% end %>
</div>
```

これで、view がシンプルになりました。
published_at を表示するための条件があることがわかり、
必要に応じて他のエンジニアは`PostComponent`クラスを見にいくでしょう。

2. モデルに関するロジックを Component クラスで定義しない

view component は UI を生成するためのクラスです。
なので、view に関するロジックだけを記述するようにしましょう。

たとえば、`@post.published_at.present?`
は post インスタンスが `published_at` という値を所持しているかどうか確認しています。
そして、`@post.published_at > Time.current`の比較を行っています。
しかし、view component にとっては post の中身の確認はどうでもよく表示する or 表示しないの判断のみが知りたいのです。

なので、このようなモデルに関するロジックは Component に記述しないようにしましょう。

```rb
# app/models/post.rb

class Post < ApplicationRecord

  def published?
    return if published_at.nil?

    published_at < Time.current
  end
end
```

```rb
# app/components/post_component.rb

class PostComponent < ViewComponent::Base
  def initialize(post:)
    @post = post
  end

  private

  def display_published_at?
    !@post.published?
  end
end
```

これで、PostComponent は`@post.published?`が返す値だけに関心を持つ健全なクラスとなりました。

3. テストをシンプルに保つ

テストについて書くとそれだけで１つの記事になるのでここではポイントとなる点を挙げます。
Ruby on Rails で使用されるテスティングフレームワークは、主に Minitest と RSpec だと思いますが、
view_component はもちろんどちらにも対応しています。

[View Component のテストのドキュメント](https://viewcomponent.org/guide/testing.html)

今回用いている、post には２種類の表示パターンが存在しています。

- Post に`published_at`が存在する
- Post に`published_at`が存在しない

なので、テストも同様に２種類のパターンだけ正しく表示されているかのテストを行いましょう。
基本的な書き方はドキュメントの通りです。
例えば、

```rb
require "rails_helper"

RSpec.describe PostComponent, type: :component do
  it "renders default" do
    post = Post.new(title: 'Default', description: 'default description')
    render_inline(described_class.new(post: post)

    expect(rendered_component).to have_text "Default"
    expect(rendered_component).to have_text "default description"
  end
end
```

このようにある条件下での正しい表示の挙動が確認できれば十分だと思います。
むしろ、このようにシンプルになるような Component 設計を心掛けましょう。

ところで、みなさん上記のテストが何かとそっくりなことにお気づきになられたでしょうか？

そうです。Preview で記述したこととほとんど同じです。
シンプルな Component ほどこれらは似ているコードになることでしょう。
`Test ≒ Preview`のようなもので、開発者自身が最初に目視で確認し Test と組み合わせることで簡単に健全な Component クラスが作成できます。
これら２つを組み合わせて最高な開発体験を手に入れましょう。

## 最後に

ここまで２回に渡って ViewComponent について話してきました。
後半では私が Component クラスを作成する時に気にしている点。どのようにすればメンテナンスがしやすい健全なコードになるのか、私個人の意見を述べました。
この記事が誰かの助けになれば幸いです。
私自身、ViewComponent は Rails でとても大きな存在になると確信しています。
これからも良い Component を作れるように精進してまいりますのでどうぞよろしくお願いします。

Watakumi
