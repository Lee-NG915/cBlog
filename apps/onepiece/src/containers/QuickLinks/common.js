import React from 'react';
import PropTypes from 'prop-types';
import ReactPicture from 'components/ReactPicture';
import style from './style.scss';

function Header({ title, subtitle }) {
  return (
    <div className={style.header}>
      <h1 className={`${style.header}__title`}>{title}</h1>
      <hr className={`${style.header}__divider`} />
      <div className={`${style.header}__subtitle`}>
        {subtitle.map((line, index) => (
          <p key={index} className={`${style.header}__line`}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.array.isRequired,
};

function HeaderImage({ url }) {
  return <ReactPicture srcset={url} alt="returns and exchanges" />;
}

HeaderImage.propTypes = {
  url: PropTypes.string.isRequired,
};

function InfoPanel({ title, text, table }) {
  const panelContent = [...text];
  if (table) {
    const { index, ...rest } = table;
    panelContent.splice(index, 0, rest);
  }

  return (
    <div className={style.infoPanel}>
      <h3 className={`${style.infoPanel}__title`}>{title}</h3>
      {panelContent.map((line, i) => {
        if (typeof line === 'string') {
          return (
            <p className={`${style.infoPanel}__line`} key={i}>
              {line}
            </p>
          );
        }
        return <Table {...line} key={i} />;
      })}
    </div>
  );
}

InfoPanel.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.array.isRequired,
  table: PropTypes.object,
};

function Table({ headers, content }) {
  return (
    <table className={style.table}>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {content.map((row, index) => (
          <tr key={index}>
            {row.map((cell) => (
              <td key={cell}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

Table.propTypes = {
  headers: PropTypes.array.isRequired,
  content: PropTypes.array.isRequired,
};

export { Header, HeaderImage, InfoPanel, Table };
