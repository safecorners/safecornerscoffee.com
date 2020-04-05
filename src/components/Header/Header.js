import React from 'react'
import { Link } from 'gatsby'
import styles from './Header.module.scss';
import { useSiteMetadata } from '../../hooks';


const Header = () => {
  const { title, author } = useSiteMetadata(); 
  return (
    <div className={styles['header']}>
      <div className={styles['header__inner']}>
        <div className={styles['header__title']}>
          <Link to="/">{title}</Link>
        </div>
      </div>
    </div>
  )
}

export default Header;