import React from 'react';
import { Helmet } from 'react-helmet';

import { css } from '@emotion/react';

import { Footer } from '../components/Footer';
import SiteNav from '../components/header/SiteNav';
import { PostFullContent } from '../components/PostContent';
import { Wrapper } from '../components/Wrapper';
import IndexLayout from '../layouts';
import {
  inner,
  outer,
  SiteArchiveHeader,
  SiteHeader,
  SiteMain,
  SiteNavMain,
} from '../styles/shared';
import { NoImage, PostFull, PostFullHeader, PostFullTitle } from '../templates/post';
import { colors } from '../styles/colors';
import { StaticImage } from 'gatsby-plugin-image';

const PageTemplate = css`
  .site-main {
    margin-top: 64px;
    padding-bottom: 4vw;
    background: #fff;
  }

  @media (prefers-color-scheme: dark) {
    .site-main {
      /* background: var(--darkmode); */
      background: ${colors.darkmode};
    }
  }
`;

const About: React.FC = () => (
  <IndexLayout>
    <Helmet>
      <title>About</title>
    </Helmet>
    <Wrapper css={PageTemplate}>
      <header className="site-archive-header no-image" css={[SiteHeader, SiteArchiveHeader]}>
        <div css={[outer, SiteNavMain]}>
          <div css={inner}>
            <SiteNav isHome={false} />
          </div>
        </div>
      </header>
      <main id="site-main" className="site-main" css={[SiteMain, outer]}>
        <div css={inner}>
          <article className="post page" css={[PostFull, NoImage]}>
            <PostFullHeader className="post-full-header">
              <PostFullTitle className="post-full-title">About</PostFullTitle>
            </PostFullHeader>

            <PostFullContent className="post-full-content">
              <div className="post-content">
                <h5>
                  好きなことを好きなだけ <br /> GitHub:{' '}
                  <a href="https://github.com/Watakumi">Watakumi</a>
                </h5>
                <p>
                  こんにちは、Watakumiです。
                  <br />
                  仕事でアプリ開発を始めて２年目に突入しました。
                  <br />
                  おかげさまで、
                  <br />
                  好きなことを好きなだけさせてもらえる日々を過ごしております。
                  <br />
                  自分の選択が間違っていなかったと言えるような"何か"を残せるように
                  <br />
                  このブログを開設しました。
                  <br />
                </p>
                <p>
                  経歴：
                  <ul>
                    <li>横浜国立大学を卒業後、横浜国立大学大学院を中退。</li>
                    <li>Ruby on Railsを主とした自社開発企業に新卒で入社。</li>
                  </ul>
                </p>
                <p>
                  スキルセット：
                  <ul>
                    <li>Ruby / Ruby on Rails の経験: 実務１年</li>
                    <li>JavaScript</li>
                    <li>AWS Lambda</li>
                  </ul>
                </p>
                <StaticImage src="../images/roomwear.png" alt="room wear" />
              </div>
            </PostFullContent>
          </article>
        </div>
      </main>
      <Footer />
    </Wrapper>
  </IndexLayout>
);

export default About;
