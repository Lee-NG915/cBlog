import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Autosuggest from 'react-autosuggest';
import Banner from 'components/Banner';
import Form, { FloatInput } from 'components/Form';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { renderImage } from 'utils/image';

import { wrapPage } from 'utils/page';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import Spinner from 'components/Spinner';
import ApiClient from 'helpers/ApiClient';

import { useFrame } from 'hooks/frame';
import ReactSvg from 'components/ReactSVG';
import classNames from 'classnames';
import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const HomeOwners = () => {
  const frame = useFrame();
  const { desktop } = useBreakpoints();
  const homeOwners = useSelector((state) => state.marketing['home-owners']);
  const user = useSelector((state) => state.auth.user);

  const data = useMemo(() => homeOwners.data?.story?.content || {}, [homeOwners]);
  const estates = useMemo(() => data.estateList, [data]);
  const [estateValue, setEstateValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [noSuggestions, setNoSuggestions] = useState(false);
  const [filteredEstateValues, setFilteredEstateValues] = useState([]);
  const filteredEstates = useMemo(
    () =>
      filteredEstateValues.length
        ? data.estateList.filter((estate) => filteredEstateValues.some((value) => value === estate.estateTitle))
        : data.estateList,
    [data, filteredEstateValues]
  );
  const theme = useMemo(
    () => ({
      container: {
        position: 'relative',
        width: '100%',
        padding: '0 15px',
        maxWidth: '500px',
        margin: '0 auto',
      },
      input: {
        width: '100%',
        maxWidth: '500px',
        height: '52px',
        padding: '10px 50px 10px 20px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        outline: 'none',
        position: 'relative',
        zIndex: 100,
      },
      suggestionsContainer: {
        position: 'absolute',
        top: '50px',
        width: 'calc(100% - 30px)',
        border: suggestions.length > 0 ? '1px solid #ccc' : 'none',
        backgroundColor: '#fff',
        borderRadius: '0  0 4px 4px',
        zIndex: 101,
        maxHeight: '50vh',
        overflowY: 'auto',
      },
      suggestionsList: {
        margin: 0,
        padding: 0,
      },
      suggestion: {
        cursor: 'pointer',
        padding: '10px 20px',
        listStyleType: 'none',
      },
    }),
    [suggestions]
  );
  const onChange = useCallback(
    (event, { newValue }) => {
      setEstateValue(newValue);
      if (newValue.trim() === '' && filteredEstateValues.length) {
        setFilteredEstateValues([]);
      }
    },
    [setEstateValue, filteredEstateValues]
  );
  const getSuggestionValue = useCallback((suggestion) => suggestion.estateTitle, []);
  const renderSuggestion = useCallback((suggestion) => {
    const { estateTitle } = suggestion;
    return <div className={`${style.homeOwners}__estateItem`}>{estateTitle}</div>;
  }, []);
  const getSuggestions = useCallback(
    (value) => {
      if (!value || !value.trim()) {
        return estates;
      }
      const inputValue = value.trim().toLowerCase();
      const inputWords = inputValue.split(/\s+/);
      const result = estates.filter((estate) => {
        const titleWords = estate.estateTitle.split(/\s+/).map((item) => item.toLowerCase());
        return inputWords.every((inputWord) => titleWords.some((titleWord) => titleWord.startsWith(inputWord)));
      });
      return result;
    },
    [estates]
  );

  const onSuggestionsFetchRequested = useCallback(
    ({ value }) => {
      const suggestions = getSuggestions(value);
      setSuggestions(suggestions);
      setNoSuggestions(!suggestions.length);
    },
    [setSuggestions, getSuggestions, setNoSuggestions]
  );
  const onSuggestionsClearRequested = useCallback(() => {
    setSuggestions([]);
    setTimeout(() => {
      setNoSuggestions(false);
    }, 200);
  }, [setSuggestions, setNoSuggestions]);

  const onSuggestionSelected = useCallback(
    (event, { suggestion }) => {
      setFilteredEstateValues([suggestion.estateTitle]);
    },
    [setFilteredEstateValues]
  );
  const onSuggestionValueClear = useCallback(() => {
    setEstateValue('');
    setFilteredEstateValues([]);
  }, [setEstateValue]);

  const clickEstate = useCallback(
    (estate) => {
      frame.openModal('homeowners', {
        estate,
        userId: user?.id,
      });
    },
    [frame, user]
  );

  const formRef = useRef(null);
  const client = useMemo(() => new ApiClient(), []);
  const [processing, setProcessing] = useState(false);
  const submit = useCallback(
    (data) => {
      if (!client) return;
      setProcessing(true);
      const { name, email, estate, interested } = data;
      const request = client.post('/estates/requests', {
        data: {
          name,
          email,
          estate,
          interested,
        },
      });
      request
        .then(() => {
          frame.openModal('response', {
            status: 'successful',
            title: 'Thank You!',
            body: 'We have received your request!',
          });
          setProcessing(false);
          formRef.current?.reset?.();
        })
        .catch((error) => {
          frame.openModal('response', { body: error });
          setProcessing(false);
        });
      return request;
    },
    [frame, client, setProcessing]
  );
  const estateFormRef = useRef(null);
  const scrollToForm = useCallback(() => {
    estateFormRef.current.scrollIntoView();
  }, [estateFormRef]);

  if (!homeOwners.data) {
    return null;
  }

  const inputProps = {
    placeholder: 'Type to filter estates',
    value: estateValue,
    onChange,
  };

  return (
    <div className={style.homeOwners}>
      <Container>
        <Banner
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: data.bannerMobile,
              loader: { ratio: '0.813' },
            },
            {
              breakpoint: 'lg',
              srcset: data.banner,
              loader: { ratio: '0.313' },
            },
          ]}
          lazy={false}
          title="new-homeowners"
          className={`${style.homeOwners}__banner`}
        >
          <h1 className={`${style.homeOwners}__title`}>{data.title}</h1>
        </Banner>
      </Container>

      <div className={`${style.homeOwners}__intro`}>
        <div className={`${style.homeOwners}__intro-detail`} dangerouslySetInnerHTML={{ __html: data.intro }} />
      </div>

      {data?.offerList && (
        <>
          <div
            className={classNames(`${style.homeOwners}__offerContainer`, {
              'is-short': data.offerList.length < 4,
            })}
          >
            <div className={`${style.homeOwners}__offer`}>
              {data.offerList?.map((item) => (
                <div key={item.title} className={`${style.homeOwners}__offer-item`}>
                  <div className={`${style.homeOwners}__offer-item-title`}>
                    {!desktop ? item.mobileTitle : item.title}
                  </div>
                  <div className={`${style.homeOwners}__offer-item-content`}>
                    {!desktop ? item.mobileIntro : item.intro}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${style.homeOwners}__offerFoot`}>T&Cs apply</div>
        </>
      )}

      <div ref={estateFormRef} className={`${style.homeOwners}__form-box`}>
        <h1 className={`${style.homeOwners}__form-title`}>{data.formTitle}</h1>
        <p className={`${style.homeOwners}__form-desc`}>{data.formDesc}</p>
        <Form formName="New Homewwners" onValidSubmit={submit} noValidate action="/" ref={formRef}>
          <div className="row">
            <div className={`col-xs-12 col-lg-6 ${style.homeOwners}__input-wrapper`}>
              <FloatInput
                type="text"
                name="name"
                autoCorrect="off"
                placeholder="Name*"
                maxLength="256"
                disabled={processing}
                required
              />
            </div>
            <div className={`col-xs-12 col-lg-6 ${style.homeOwners}__input-wrapper`}>
              <FloatInput
                type="text"
                name="email"
                autoCorrect="off"
                placeholder="Email*"
                maxLength="256"
                disabled={processing}
                validations="isEmail"
                validationError="Please provide a valid email."
                required
              />
            </div>
          </div>
          <div className="row">
            <div className={`col-xs-12 col-lg-6 ${style.homeOwners}__input-wrapper`}>
              <FloatInput
                type="text"
                name="estate"
                autoCorrect="off"
                placeholder="Name of Estate*"
                maxLength="256"
                disabled={processing}
                required
              />
            </div>
            <div className={`col-xs-12 col-lg-6 ${style.homeOwners}__input-wrapper`}>
              <FloatInput
                type="text"
                name="interested"
                autoCorrect="off"
                placeholder="Postal Code*"
                maxLength="256"
                validations={{
                  matchRegexp: /^[0-9]{6}$/,
                }}
                validationError="Please provide a valid postal code."
                disabled={processing}
                required
              />
            </div>
          </div>

          <div className={`row ${style.homeOwners}__submit-wrapper`}>
            <div className={`${style.homeOwners}__submit`}>
              <input
                className="btn btn-primary btn-block"
                type="submit"
                disabled={processing}
                value={processing ? ' ' : 'Submit'}
              />
              {processing && <Spinner small />}
            </div>
          </div>
        </Form>
      </div>

      <div className={`${style.homeOwners}__estateContainer`}>
        <div className={`${style.homeOwners}__estateTitle`}>
          <h2>{data.estateTitle}</h2>
        </div>
        <div className={`${style.homeOwners}__suggestionsContainer`}>
          <Autosuggest
            theme={theme}
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            onSuggestionSelected={onSuggestionSelected}
            focusInputOnSuggestionClick={false}
          />
          {!!estateValue && (
            <button type="button" className={`${style.homeOwners}__close btn`} onClick={onSuggestionValueClear}>
              <ReactSvg name="close" />
            </button>
          )}

          {noSuggestions && (
            <div className={`${style.homeOwners}__noSuggestions`} onClick={scrollToForm}>
              Don't see your estate?
            </div>
          )}
        </div>

        <Container
          fixed
          sx={(theme) => ({
            display: 'grid',
            mt: '50px',
            width: '100%',
            gridTemplateColumns: '1rf',
            columnGap: 0,
            ...(desktop && {
              mt: '80px',
              maxWidth: '1170px',
              gridTemplateColumns: '1fr 1fr 1fr',
              columnGap: '30px',
            }),
          })}
        >
          {filteredEstates.map((item) => (
            <div
              key={item.estateTitle}
              className={`${style.homeOwners}__estateList-item`}
              onClick={() => clickEstate(item.estateTitle)}
            >
              <div className={`${style.homeOwners}__estateList-item-img`}>
                {renderImage(item.estateImage, 0.73, 0.33, {
                  alt: item.estateTitle,
                })}
                {desktop ? <div className="cover">Get Promo Code</div> : null}
              </div>
              <div className={`${style.homeOwners}__estateList-item-content`}>{item.estateTitle}</div>
            </div>
          ))}
        </Container>
      </div>
    </div>
  );
};

export default asyncLoad([({ store: { dispatch } }) => dispatch(loadMarketing('home-owners'))])(wrapPage()(HomeOwners));
