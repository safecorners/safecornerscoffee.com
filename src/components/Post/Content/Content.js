// @flow strict
import React from 'react';
import { Link } from 'gatsby';
import moment from 'moment';
import styles from './Content.module.scss';

type Props = {
  body: string,
  title: string,
  date: string,
  tags?: string[],
  tagSlugs?: string[]
};

const Content = ({ body, title ,date, tags, tagSlugs }: Props) => (
  <div className={styles['content']}>
    <h1 className={styles['content__title']}>{title}</h1>
    <div className={styles['content__meta']}>
      <time className={styles['content__meta-time']} dateTime={moment(date).format('MMMM D, YYYY')}>
        {moment(date).format('MMMM D YYYY')}
      </time>
      <span className={styles['content__meta-divider']} />
      <span className={styles['content__meta-tags']}>
        {tags && tags.map((tag, i) => (
          <Link to={tagSlugs[i]} className={styles['content__meta-tags-link']} key={tag}>{tag}</Link>
        ))}
      </span>
    </div>
    <div className={styles['content__body']} dangerouslySetInnerHTML={{ __html: body }} />
  </div>
);

export default Content;
