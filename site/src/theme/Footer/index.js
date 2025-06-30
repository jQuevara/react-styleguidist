/**
 * Custom Footer component that includes SocialIcons
 */
import React from 'react';
import Footer from '@theme-original/Footer';
import SocialIcons from '../../components/SocialIcons';
import styles from './styles.module.css';

function FooterWrapper(props) {
  return (
    <>
      <Footer {...props} />
      <div className={styles.socialIconsContainer}>
        <SocialIcons />
      </div>
    </>
  );
}

export default FooterWrapper;