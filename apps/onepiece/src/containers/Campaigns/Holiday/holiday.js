/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Link } from 'react-router';

import Banner from 'components/Banner';

import ReactPicture from 'components/ReactPicture';
import { cloudinaryRoot } from 'config';
import style from './style.scss';

const HolidayMain = ({ bannerProps, name, subName, intros, about, className = `${style.holiday}__sectionHead` }) => (
  <Banner {...bannerProps}>
    <section className={className}>
      <div className={`${style.holiday}__sectionHead-header`}>
        <h2 className={`${style.holiday}__sectionHead-header-name`}>{name}</h2>
        <div className={`${style.holiday}__sectionHead-header-underline`}>
          <span className={`${style.holiday}__sectionHead-header-subName`}>{subName}</span>
          <span className={`${style.holiday}__sectionHead-header-about`}>{about}</span>
        </div>
      </div>
      <ul className={`${style.holiday}__sectionHead-intro`}>
        {intros.map((intro, index) => (
          <li key={intro} data-idx={index + 1}>
            {intro}
          </li>
        ))}
      </ul>
    </section>
  </Banner>
);

const HolidayAbout = ({ src, content, className = `${style.holiday}__sectionAbout`, direction = 'right', width }) => {
  const TargetImage = ({ className, direction, src, loader, width }) => (
    <div
      className={`${style.holiday}__sectionAbout-image ${style.holiday}__sectionAbout-image${
        direction === 'right' ? 'R' : 'L'
      }`}
    >
      <div className={className}>
        <ReactPicture
          srcset={`${cloudinaryRoot}${src}`}
          className={`${className}-target`}
          loader={loader}
          alt="holiday"
        />
      </div>
    </div>
  );
  // get textContent item
  const TextContent = ({ content, className }) => (
    <div className={className}>
      <p className={`${className}-target`}>{content}</p>
    </div>
  );
  return (
    <div className={className}>
      <TargetImage
        className={`${style.holiday}__sectionAbout-image-${direction}`}
        direction={direction}
        src={src}
        loader={{ ratio: '1.1' }}
        width={width}
      />
      <TextContent content={content} className={`${style.holiday}__sectionAbout-content`} />
    </div>
  );
};

const HolidayContentItem = ({ src, loader, title, intro, link, linkHref, index, last, direction, width }) =>
  direction === 'left' ? (
    <>
      <Link to={linkHref} className={`${style.holiday}__sectionContent-${index}-row2x ${last ? 'last' : ''}`}>
        <ReactPicture srcset={`${cloudinaryRoot}${src}`} loader={loader} alt={title} />
      </Link>
      <div className={`${style.holiday}__sectionContent-row1x ${last ? 'last' : ''}`}>
        <h3 className={`${style.holiday}__sectionContent-head`}>{title}</h3>
        <div className={`${style.holiday}__sectionContent-intro`}>{intro}</div>
        <Link to={linkHref} className={`${style.holiday}__sectionContent-link`}>
          {link}
        </Link>
      </div>
    </>
  ) : (
    <>
      <Link to={linkHref} className={`${style.holiday}__sectionContent-${index}-row2x-l ${last ? 'last' : ''}`}>
        <ReactPicture srcset={`${cloudinaryRoot}${src}`} loader={loader} alt={title} />
      </Link>
      <div className={`${style.holiday}__sectionContent-row1x ${last ? 'last' : ''}`}>
        {title && <h3 className={`${style.holiday}__sectionContent-head right`}>{title}</h3>}
        <div className={`${style.holiday}__sectionContent-intro right`}>{intro}</div>
        <Link to={linkHref} className={`${style.holiday}__sectionContent-link right`}>
          {link}
        </Link>
        {!title && <div className={`${style.holiday}__sectionContent-margin`} />}
      </div>
    </>
  );

const HolidayContents = ({ contents, className = `${style.holiday}__sectionContent` }) => {
  if (!Array.isArray(contents)) {
    // eslint-disable-next-line no-param-reassign
    contents = [contents];
  }
  return (
    <div className={className}>
      {contents.map((content, index) => (
        <HolidayContentItem {...content} key={content.src} last={index === contents.length - 1} />
      ))}
    </div>
  );
};

const HolidayFoot = ({ bannerProps, intro, link, linkHref, className = `${style.holiday}__sectionFoot` }) => (
  <div className={className}>
    <Banner {...bannerProps} />
    <div className={`${className}-content`}>
      <div className={`${className}-content-intro`}>{intro}</div>
      <Link className={`${className}-content-link`} to={linkHref}>
        {link}
      </Link>
    </div>
  </div>
);

const HolidayAdd = ({
  src,
  intro,
  width,
  link,
  linkHref,
  loader,
  head,
  className = `${style.holiday}__sectionAdd`,
}) => (
  <div className={className}>
    <div className={`${className}-image`}>
      <ReactPicture srcset={`${cloudinaryRoot}${src}`} loader={loader} />
    </div>
    <div className={`${className}-intro`}>
      <h3 className={`${className}-intro-head`}>{head}</h3>
      <div className={`${className}-intro-content`}>
        {intro}
        <Link className={`${className}-intro-content-reset`} to={linkHref}>
          {link}
        </Link>
      </div>
    </div>
  </div>
);

export { HolidayMain, HolidayAbout, HolidayContents, HolidayFoot, HolidayAdd };
