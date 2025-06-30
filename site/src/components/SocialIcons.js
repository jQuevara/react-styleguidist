import React from 'react';
import PropTypes from 'prop-types';
import { GitHubIcon, TwitterIcon, LinkedInIcon } from './icons';
import styles from './SocialIcons.module.css';

function SocialIcons({ githubUrl, twitterUrl, linkedinUrl }) {
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      console.warn(`Invalid URL provided to SocialIcons: ${url}`);
      return false;
    }
  };

  return (
    <div className={styles.container}>
      {githubUrl && isValidUrl(githubUrl) && (
        <a
          href={githubUrl}
          className={styles.iconLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <GitHubIcon className={styles.icon} />
        </a>
      )}
      
      {twitterUrl && isValidUrl(twitterUrl) && (
        <a
          href={twitterUrl}
          className={styles.iconLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
        >
          <TwitterIcon className={styles.icon} />
        </a>
      )}
      
      {linkedinUrl && isValidUrl(linkedinUrl) && (
        <a
          href={linkedinUrl}
          className={styles.iconLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <LinkedInIcon className={styles.icon} />
        </a>
      )}
    </div>
  );
}

SocialIcons.propTypes = {
  githubUrl: PropTypes.string,
  twitterUrl: PropTypes.string,
  linkedinUrl: PropTypes.string
};

SocialIcons.defaultProps = {
  githubUrl: 'https://github.com/styleguidist/react-styleguidist',
  twitterUrl: 'https://twitter.com/styleguidist',
  linkedinUrl: 'https://www.linkedin.com/company/styleguidist'
};

export default SocialIcons;