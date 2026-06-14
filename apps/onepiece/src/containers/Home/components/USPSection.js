import React from 'react';
import style from '../style.scss';

const ShippingSvg = (
  <svg width="67" height="67" viewBox="0 0 67 67">
    <g fill="none" fillRule="evenodd">
      <mask id="b" fill="#fff">
        <path id="a" d="M0 0h67v67H0z" />
      </mask>
      <path d="M66 1v65H1V1h65zM1 33.5h65" stroke="#DBCFB5" strokeWidth="2" strokeDasharray="0,0" mask="url(#b)" />
      <path d="M32.28 1l32.19 32.5L32.28 66" stroke="#DBCFB5" strokeWidth="2" strokeDasharray="0,0" mask="url(#b)" />
    </g>
  </svg>
);

const ReturnsSvg = (
  <svg width="67" height="67" viewBox="0 0 67 67">
    <g fill="none" fillRule="evenodd">
      <mask id="b" fill="#fff">
        <path id="a" d="M0 0h67v67H0z" />
      </mask>
      <path d="M66 1v65H1V1h65z" stroke="#DBCFB5" strokeWidth="2" strokeDasharray="0,0" mask="url(#b)" />
      <path
        d="M23.53 23.12l-4.43 1.09-.26-.3 6.31-3.27 1.31.23v25.41l-2.93.04v-23.2z"
        fill="#DBCFB5"
        fillRule="nonzero"
        mask="url(#b)"
      />
      <path
        d="M41.55 38.44H29.91l-.18-.41 14-17.23h.63v16h3.76v1.61h-3.76c0 1.76-.07 7 0 7.88l-2.81.03v-7.88zm-9.65-1.63h9.65v-12l-9.65 12z"
        fill="#DBCFB5"
        mask="url(#b)"
      />
      <path
        d="M66 33.5C66 51.45 51.45 66 33.5 66S1 51.45 1 33.5 15.55 1 33.5 1 66 15.55 66 33.5z"
        stroke="#DBCFB5"
        strokeWidth="2"
        strokeDasharray="0,0"
        mask="url(#b)"
      />
    </g>
  </svg>
);

const Returns30Svg = (
  <svg width="67" height="67" viewBox="0 0 97 97">
    <defs>
      <path id="A" d="M0 0h96.999v97H0z" />
    </defs>
    <g fillRule="evenodd">
      <path fill="#dbcfb5" d="M0 97h97V.003H0V97zm2.896-2.896h91.211V2.896H2.896v91.208z" />
      <mask id="B" fill="#fff">
        <use xlinkHref="#A" />
      </mask>
      <g fill="#dbcfb5">
        <path
          d="M48.5 97C21.757 97 0 75.243 0 48.5S21.757 0 48.5 0 97 21.757 97 48.5 75.243 97 48.5 97m0-94.104C23.352 2.896 2.896 23.352 2.896 48.5S23.352 94.104 48.5 94.104 94.104 73.645 94.104 48.5 73.648 2.896 48.5 2.896"
          mask="url(#B)"
        />
        <path d="M19.808 61.069c1.951 2.511 4.071 4.627 8.698 4.627 5.688 0 8.643-4.349 8.643-9.196 0-5.912-4.404-8.753-10.872-8.753h-1.45v-.728c2.621-.168 10.315-1.838 10.315-8.921 0-4.401-2.343-7.135-6.97-7.135-3.734 0-6.413 2.511-8.196 5.184l-1.34-3.009c1.728-1.34 4.854-3.844 10.26-3.844 6.575 0 10.532 3.232 10.532 8.306s-4.737 8.141-7.801 8.584c5.077.443 10.089 3.401 10.089 9.646 0 7.805-5.795 11.817-12.82 11.817-6.358 0-8.808-2.284-11.095-3.624l2.006-2.954zm54.538-12.374c0-8.529-1.954-17.677-11.707-17.677-9.199 0-11.542 9.481-11.542 18.01 0 9.866 4.236 17.117 11.542 17.117 7.746 0 11.707-7.584 11.707-17.45m-28.154.333c0-10.535 6.3-19.735 16.447-19.735 10.982 0 16.557 8.859 16.557 19.401 0 12.098-6.523 19.01-16.447 19.01-10.37 0-16.557-6.523-16.557-18.676" />
      </g>
    </g>
  </svg>
);

const PaySvg = (
  <svg width="67" height="67" viewBox="0 0 67 67">
    <g fill="none" fillRule="evenodd">
      <mask id="b" fill="#fff">
        <path id="a" d="M0 0h67v67H0z" />
      </mask>
      <path
        d="M65.82 1.24v64.64H1.18V1.24h64.64z"
        stroke="#DBCFB5"
        strokeWidth="2"
        strokeDasharray="0,0"
        mask="url(#b)"
      />
      <path
        d="M33.5 33.5c-8.975 0-16.25-7.275-16.25-16.25S24.525 1 33.5 1s16.25 7.275 16.25 16.25S42.475 33.5 33.5 33.5zM33.5 66c-8.975 0-16.25-7.275-16.25-16.25S24.525 33.5 33.5 33.5s16.25 7.275 16.25 16.25S42.475 66 33.5 66z"
        stroke="#DBCFB5"
        strokeWidth="2"
        strokeDasharray="0,0"
        mask="url(#b)"
      />
      <path
        d="M49.75 49.75c-8.975 0-16.25-7.275-16.25-16.25s7.275-16.25 16.25-16.25S66 24.525 66 33.5s-7.275 16.25-16.25 16.25zM17.25 49.75C8.275 49.75 1 42.475 1 33.5s7.275-16.25 16.25-16.25S33.5 24.525 33.5 33.5s-7.275 16.25-16.25 16.25z"
        stroke="#DBCFB5"
        strokeWidth="2"
        strokeDasharray="0,0"
        mask="url(#b)"
      />
    </g>
  </svg>
);

const SwatchesSvg = (
  <svg width="67" height="67" viewBox="0 0 67 67">
    <g fill="none" fillRule="evenodd">
      <mask id="b" fill="#fff">
        <path id="a" d="M0 0h67v67H0z" />
      </mask>
      <path d="M66 1v65H1V1h65z" stroke="#DBCFB5" strokeWidth="2" strokeDasharray="0,0" mask="url(#b)" />
      <path d="M66 1v65H1V1h65z" stroke="#DBCFB5" strokeWidth="2" strokeDasharray="0,0" mask="url(#b)" />
      <path d="M66 1v65H1V1h65z" stroke="#DBCFB5" strokeWidth="2" strokeDasharray="0,0" mask="url(#b)" />
      <path d="M22.09 1v65H1V1h21.09z" stroke="#DBCFB5" strokeWidth="2" strokeDasharray="0,0" mask="url(#b)" />
      <path
        d="M44.045 22.945v65h-21.09v-65h21.09z"
        stroke="#DBCFB5"
        strokeWidth="2"
        strokeDasharray="0,0"
        mask="url(#b)"
        transform="rotate(90 33.5 55.445)"
      />
      <path
        d="M44.91 22.09V44.9H22.1V22.09h22.81z"
        stroke="#DBCFB5"
        strokeWidth="2"
        strokeDasharray="0,0"
        mask="url(#b)"
        transform="rotate(180 33.505 33.495)"
      />
    </g>
  </svg>
);
const salePoints = {
  US: [
    {
      name: 'FLAT RATE\nSHIPPING*',
      desc: 'Delivery calculated per shipment',
      icon: ShippingSvg,
      id: 'hp-shipping-usp',
    },
    {
      name: '30-DAY\nRETURNS',
      desc: 'Hassle-free returns',
      icon: Returns30Svg,
    },
    {
      name: 'PAY OVER\nTIME',
      desc: 'In auto monthly installments',
      icon: PaySvg,
    },
    {
      name: 'FREE\nSWATCHES',
      desc: 'We encourage pickiness',
      icon: SwatchesSvg,
    },
  ],
  CA: [
    {
      name: 'FLAT RATE\nSHIPPING*',
      desc: 'Delivery calculated per shipment',
      icon: ShippingSvg,
      id: 'hp-shipping-usp',
    },
    {
      name: '30-DAY\nRETURNS',
      desc: 'Hassle-free returns',
      icon: Returns30Svg,
    },
    {
      name: 'FREE\nSWATCHES',
      desc: 'We encourage pickiness',
      icon: SwatchesSvg,
    },
  ],
  SG: [
    {
      name: 'FLAT RATE\nSHIPPING*',
      desc: 'Free shipping on orders $300+',
      icon: ShippingSvg,
      id: 'hp-shipping-usp',
    },
    {
      name: '30-DAY\nRETURNS',
      desc: 'Hassle-free returns',
      icon: Returns30Svg,
    },
    {
      name: 'PAY OVER\nTIME',
      desc: 'In auto monthly instalments',
      icon: PaySvg,
    },
    {
      name: 'FREE\nSWATCHES',
      desc: 'We encourage pickiness',
      icon: SwatchesSvg,
    },
  ],
  AU: [
    {
      name: 'CAPPED\nSHIPPING',
      desc: 'No headaches over delivery fees',
      icon: ShippingSvg,
      id: 'hp-shipping-usp',
    },
    {
      name: '30-DAY\nRETURNS',
      desc: 'Hassle-free returns',
      icon: Returns30Svg,
    },
    {
      name: 'PAY OVER\nTIME',
      desc: 'In auto monthly instalments',
      icon: PaySvg,
    },
    {
      name: 'FREE\nSWATCHES',
      desc: 'We encourage pickiness',
      icon: SwatchesSvg,
    },
  ],
  UK: [
    {
      name: 'FLAT RATE\nSHIPPING*',
      desc: 'Delivery calculated per shipment',
      icon: ShippingSvg,
      id: 'hp-shipping-usp',
    },
    {
      name: '30-DAY\nRETURNS',
      desc: 'Hassle-free returns',
      icon: Returns30Svg,
    },
    {
      name: 'NEXT WEEK\nDELIVERY',
      desc: 'Skip the wait for select items',
      icon: PaySvg,
    },
    {
      name: 'FREE\nSWATCHES',
      desc: 'We encourage pickiness',
      icon: SwatchesSvg,
    },
  ],
};
const USPSection = () => (
  <ul className={`${style.usp}`}>
    {salePoints[__COUNTRY__]?.map((salePoint, i) => (
      <li key={i} className={`${style.usp}__item`}>
        {salePoint.icon}
        <div className={`${style.usp}__content`} {...(salePoint.id && { id: salePoint.id })}>
          <div>{salePoint.name}</div>
          {/* TODO 长短文字换行问题会导致不对齐 */}
          <p>{salePoint.desc}</p>
        </div>
      </li>
    ))}
  </ul>
);

export default React.memo(USPSection);
