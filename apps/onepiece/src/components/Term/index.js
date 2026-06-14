import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import style from './style.scss';

const Term = ({ para }) => (
  <div className={style.paragraph}>
    {para.title && (
      <h3
        className={para.titleStyle ? `${style.paragraph}__title--${para.titleStyle}` : ''}
        dangerouslySetInnerHTML={{ __html: para.title }}
      />
    )}
    {para.content.map((c, index) => {
      if (typeof c === 'string') {
        return (
          <div
            className={`${style.paragraph}__row`}
            key={index}
            dangerouslySetInnerHTML={{
              __html: c,
            }}
          />
        );
      }
      if (c.type === 'table') {
        return (
          <table className={`${style.paragraph}__row table table-striped`} key={index}>
            <thead>
              <tr>
                {c.headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.content.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, index) => (
                    <td key={index}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      if (c.type === 'link') {
        return (
          <Link className={`${style.paragraph}__row`} to={c.src} key={index}>
            {c.text}
          </Link>
        );
      }
      if (c.type === 'list') {
        return (
          <ul key={index}>
            {c.content.map((l, index) => (
              <li key={index}>{l}</li>
            ))}
          </ul>
        );
      }
      if (c.type === 'component') {
        return (
          <div key={index} className={`${style.paragraph}__row ${c.className}`}>
            {c.content}
          </div>
        );
      }
      return null;
    })}
  </div>
);

Term.propTypes = {
  para: PropTypes.shape({
    title: PropTypes.string,
    titleStyle: PropTypes.string,
    content: PropTypes.array,
  }),
};

export default Term;
