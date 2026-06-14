const renderDisposalServiceSupplementDesc = (caseType, country) => {
  switch (country) {
    case 'SG':
      switch (caseType) {
        case 'dismantled':
          return (
            <ul>
              <li>Can be dismantled with ease and fit in the lift</li>
              <li>Must be free from termites, bed bugs or other living organisms</li>
              <li>Is not heavier than 80kg</li>
            </ul>
          );
        case 'contact':
          return (
            <div>If you have any questions about our disposal service, contact our customer hotline at 3138 1999.</div>
          );
        default:
          return null;
      }
    case 'US':
      switch (caseType) {
        case 'dismantled':
          return (
            <ul>
              <li>
                Can be dismantled with ease and fit in the elevator if required. Note: This does not include disassembly
                of items intended for disposal.
              </li>
              <li>Must be free from termites, bed bugs or other living organisms</li>
              <li>Is not heavier than 175 pounds</li>
            </ul>
          );
        case 'contact':
          return (
            <div>
              If you have any questions about our disposal service, you may get in touch with us{' '}
              <a href="/us/contact-us" style={{ color: '#778379', textDecoration: 'underline' }}>
                here
              </a>
              .
            </div>
          );
        default:
          return null;
      }
    default:
      return null;
  }
};

export default renderDisposalServiceSupplementDesc;
