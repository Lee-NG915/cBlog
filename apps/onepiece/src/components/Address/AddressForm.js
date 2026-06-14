import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Input from 'components/HookForm/Input';
import Select from 'components/HookForm/Select';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import lang from 'utils/lang';
import config from 'config';
import { ArrowBtn } from 'components/Button';
import { spliceByErrorTitle } from 'utils/error';
import { useForm } from 'react-hook-form';
import isEqual from 'lodash/isEqual';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { unSavedAddressHandler } from './utils/index';
import style from './style.scss';

const AddressForm = ({ title, address, mode, onSubmit, onCancel, id, onChange, type }, { frame }) => {
  const { desktop } = useBreakpoints();
  const {
    company = '',
    building_name = '',
    building_type,
    street = '',
    street_number = '',
    level = '',
    flat = '',
    address1 = '',
    address2 = '',
    zipcode = '',
    firstname = '',
    lastname = '',
    phone = '',
    alternative_phone = '',
    state,
    city,
    description,
  } = address;

  let _address1;
  let buildingTypes = {
    HDB: 'HDB',
    'Condo / Apartment': 'Condo / Apartment',
    Landed: 'Landed',
    Commercial: 'Commercial',
  };

  if (!config.addressFeatureInSG) {
    _address1 = `${street_number} ${street}`.trim();
    // for AU
    buildingTypes = {
      'Condo / Apartment': 'Apartment',
      House: 'House',
      Commercial: 'Commercial',
    };
  }

  if (config.addressFeatureInAU && description) {
    const reg = new RegExp(`^(.*?)${street.split(' ', 1)[0]}`);
    const matchArr = description.match(reg);
    if (matchArr && Array.isArray(matchArr)) {
      _address1 = `${matchArr[1]}${street}`.trim();
    }
  }

  const [processing, setProcessing] = useState(false);
  const [showFloorAndUnit, setShowFloorAndUnit] = useState(true);
  const address1Temp = (mode === 'partial-edit' || mode === 'edit' ? _address1 : address1) || '';

  // 需求澄清：由于signup模块设置了默认name: Castlery Customer，
  // 但是默认姓名给配送等服务带来困难，所以在创建地址时，如果用户的默认姓名是Castlery Customer,则默认为空
  const reDefaultNames = useMemo(() => {
    const { firstname, lastname } = address;
    if (firstname && lastname) {
      const name = `${firstname}${lastname}`.trim().toUpperCase();
      if (name === 'CASTLERYCUSTOMER') {
        return { firstname: '', lastname: '' };
      }
      return { firstname, lastname };
    }
    return { firstname: firstname ?? '', lastname: lastname ?? '' };
  }, [address]);

  const formValues = {
    company,
    building_name,
    building_type,
    country: lang.t('common.country_whole_name'),
    firstname: reDefaultNames.firstname,
    lastname: reDefaultNames.lastname,
    phone,
    alternative_phone,
    street,
    street_number,
    level,
    flat,
    zipcode,
    address1: address1Temp.trim(),
    address2,
    city,
    state,
  };
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    values: formValues,
  });

  const cancelHandler = () => {
    const formValuesChanged = !isEqual(formValues, getValues());
    if (formValuesChanged) {
      unSavedAddressHandler({ frame, cancelCallbck: onCancel });
    } else {
      onCancel();
    }
  };

  const onFormSubmit = (formData) => {
    let finalData;
    const reFormData = {
      ...formData,
      zipcode: config.regionalZipcodeFormatForValidate(formData.zipcode),
    };

    if (config.addressFeatureInSG) {
      finalData = {
        ...address,
        ...reFormData,
      };

      finalData.is_manual =
        (address.building_name || '') !== reFormData.building_name ||
        address.building_type !== reFormData.building_type ||
        address.street !== reFormData.street ||
        address.street_number !== reFormData.street_number ||
        address.zipcode !== reFormData.zipcode;
    } else {
      finalData = {
        ...address,
        ...reFormData,
        is_manual: true,
        street: mode === 'edit' ? reFormData.address1 : address.street,
        street_number: mode === 'edit' ? '' : address.street_number,
        state_name: reFormData.state_name || reFormData.state,
      };
    }

    if (onSubmit) {
      setProcessing(true);
      return onSubmit(finalData)
        .then(() => {
          setProcessing(false);
        })
        .catch((err) => {
          setProcessing(false);
          spliceByErrorTitle(err);
          frame.openModal('response', { body: err });
        });
    }
  };

  const toggleFloorAndUnit = () => {
    setShowFloorAndUnit(!showFloorAndUnit);
  };

  // shared input fields
  const companyInput = (
    <Input
      label="company"
      name="Company Name (Optional)"
      autoComplete="organization"
      readOnly={!!(mode === 'partial-edit' && company)}
      register={register}
      errors={errors}
      isRequired={false}
    />
  );

  const buildingInput = (
    <Input
      label="building_name"
      name="Building Name (Optional)"
      readOnly={!!(mode === 'partial-edit' && building_name)}
      register={register}
      errors={errors}
      isRequired={false}
    />
  );

  const buildingTypeInput = (
    <Select
      register={register}
      label="building_type"
      name="Building Type *"
      options={buildingTypes}
      setValue={setValue}
      errors={errors}
    />
  );

  const countryInput = (
    <Input label="country" name="Country *" register={register} errors={errors} readOnly isRequired={false} />
  );

  const firstnameInput = (
    <Input
      label="firstname"
      autoComplete="given-name"
      name="First Name *"
      maxLength={32}
      register={register}
      errors={errors}
    />
  );

  const lastnameInput = (
    <Input
      label="lastname"
      autoComplete="family-name"
      name="Last Name *"
      maxLength={32}
      errors={errors}
      register={register}
    />
  );

  const phoneInput = (
    <Input label="phone" type="tel" name="Phone Number *" errors={errors} setValue={setValue} register={register} />
  );

  const altPhoneInput = (
    <Input
      label="alternative_phone"
      type="tel"
      errors={errors}
      name="Alternate Phone Number (Optional)"
      register={register}
      setValue={setValue}
      isRequired={false}
    />
  );

  const zipcodeInput = (
    <Input
      label="zipcode"
      name={config.addressFormFeature.formZipcodeName}
      autoComplete="postal-code"
      errors={errors}
      register={register}
      setValue={setValue}
    />
  );

  // sg specific input fields
  let streetInput;
  let blockInput;
  let floorInput;
  let unitInput;

  // the other
  let stateInput;
  let cityInput;
  let address1Input;
  let address2Input;

  if (config.addressFeatureInSG) {
    streetInput = (
      <Input
        errors={errors}
        label="street"
        name="Street Address *"
        readOnly={!!(mode === 'partial-edit' && street)}
        register={register}
      />
    );

    blockInput = (
      <Input
        label="street_number"
        name="Block/House *"
        errors={errors}
        readOnly={!!(mode === 'partial-edit' && street_number)}
        register={register}
      />
    );

    floorInput = (
      <Input
        label="level"
        name="Floor *"
        readOnly={!!(mode === 'partial-edit' && level)}
        register={register}
        errors={errors}
      />
    );

    unitInput = (
      <Input
        label="flat"
        name="Unit *"
        errors={errors}
        readOnly={!!(mode === 'partial-edit' && flat)}
        register={register}
      />
    );
  } else {
    address1Input = (
      <Input label="address1" errors={errors} name="Street Address *" maxLength={512} register={register} />
    );

    address2Input = (
      <Input
        label="address2"
        name="Apartment, suite, etc. (Optional)"
        errors={errors}
        maxLength={512}
        register={register}
        isRequired={false}
      />
    );

    stateInput = (
      <Select
        register={register}
        label="state"
        name={config.addressFormFeature.formStateName}
        autoComplete="address-level1"
        options={config.states}
        notSelectable={!!(mode === 'partial-edit' && state)}
        setValue={setValue}
        errors={errors}
        getValues={getValues}
      />
    );

    cityInput = (
      <Input label="city" name={config.addressFormFeature.formCityName} errors={errors} register={register} />
    );
  }

  let formLayout;
  if (config.addressFeatureInSG) {
    formLayout = (
      <>
        <div>
          <div className={`${style.address}__layout__half`}>{firstnameInput}</div>
          <div className={`${style.address}__layout__half`}>{lastnameInput}</div>
        </div>

        {desktop ? (
          <div>
            <div className={`${style.address}__layout__half`}>{phoneInput}</div>
            <div className={`${style.address}__layout__half`}>{altPhoneInput}</div>
          </div>
        ) : (
          <>
            <div>
              <div className={`${style.address}__layout__whole`}>{phoneInput}</div>
            </div>
            <div>
              <div className={`${style.address}__layout__whole`}>{altPhoneInput}</div>
            </div>
          </>
        )}

        {desktop ? (
          <div>
            <div className={`${style.address}__layout__half`}>{companyInput}</div>
            <div className={`${style.address}__layout__half`}>{buildingInput}</div>
          </div>
        ) : (
          <>
            <div>
              <div className={`${style.address}__layout__whole`}>{companyInput}</div>
            </div>
            <div>
              <div className={`${style.address}__layout__whole`}>{buildingInput}</div>
            </div>
          </>
        )}

        <div>
          <div className={`${style.address}__layout__whole`}>{streetInput}</div>
        </div>

        <div>
          <div className={`${style.address}__layout__whole`}>{blockInput}</div>
        </div>

        {showFloorAndUnit && (
          <div>
            <div className={`${style.address}__layout__half`}>{floorInput}</div>
            <div className={`${style.address}__layout__half`}>{unitInput}</div>
          </div>
        )}

        <div
          className={classNames(`${style.address}__form__fnu`, {
            'is-checked': !showFloorAndUnit,
          })}
        >
          <div className={`${style.address}__layout__whole`}>
            <button
              type="button"
              onClick={() => toggleFloorAndUnit()}
              className={classNames('btn', {
                'is-checked': !showFloorAndUnit,
              })}
            >
              <span className={`${style.address}__form__fnu__check`}>
                {!showFloorAndUnit && <ReactSVG name="check-circle-fill" />}
              </span>
              <span>Floor &amp; Unit is not applicable for this address</span>
            </button>
          </div>
        </div>

        <div>
          <div className={`${style.address}__layout__whole`}>{buildingTypeInput}</div>
        </div>

        <div>
          <div className={`${style.address}__layout__half`}>{countryInput}</div>
          <div className={`${style.address}__layout__half`}>{zipcodeInput}</div>
        </div>
      </>
    );
  } else {
    formLayout = (
      <>
        <div>
          <div className={`${style.address}__layout__half`}>{firstnameInput}</div>
          <div className={`${style.address}__layout__half`}>{lastnameInput}</div>
        </div>

        {desktop ? (
          <div>
            <div className={`${style.address}__layout__half`}>{phoneInput}</div>
            <div className={`${style.address}__layout__half`}>{altPhoneInput}</div>
          </div>
        ) : (
          <>
            <div>
              <div className={`${style.address}__layout__whole`}>{phoneInput}</div>
            </div>
            <div>
              <div className={`${style.address}__layout__whole`}>{altPhoneInput}</div>
            </div>
          </>
        )}
        {config.showApartmentBeforeStreet ? (
          <>
            <div>
              <div className={`${style.address}__layout__whole`}>{address2Input}</div>
            </div>

            <div>
              <div className={`${style.address}__layout__whole`}>{address1Input}</div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className={`${style.address}__layout__whole`}>{address1Input}</div>
            </div>
            <div>
              <div className={`${style.address}__layout__whole`}>{address2Input}</div>
            </div>
          </>
        )}

        {config.addressFeatureInAU && (
          <div>
            <div className={`${style.address}__layout__whole`}>{buildingTypeInput}</div>
          </div>
        )}

        <div>
          <div className={`${style.address}__layout__whole`}>{countryInput}</div>
        </div>

        {desktop ? (
          <>
            {config.addressFormFeature.enabledShowStateInAddressForm ? (
              <>
                <div>
                  <div className={`${style.address}__layout__half`}>{stateInput}</div>
                  <div className={`${style.address}__layout__half`}>{cityInput}</div>
                </div>
                <div>
                  <div className={`${style.address}__layout__half`}>{zipcodeInput}</div>
                  <div className={`${style.address}__layout__half`}>{companyInput}</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className={`${style.address}__layout__half`}>{cityInput}</div>
                  <div className={`${style.address}__layout__half`}>{zipcodeInput}</div>
                </div>
                <div>
                  <div className={`${style.address}__layout__whole`}>{companyInput}</div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {config.addressFormFeature.enabledShowStateInAddressForm ? (
              <>
                <div>
                  <div className={`${style.address}__layout__half`}>{stateInput}</div>
                  <div className={`${style.address}__layout__half`}>{cityInput}</div>
                </div>

                <div>
                  <div className={`${style.address}__layout__whole`}>{zipcodeInput}</div>
                </div>
                <div>
                  <div className={`${style.address}__layout__whole`}>{companyInput}</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className={`${style.address}__layout__half`}>{cityInput}</div>
                  <div className={`${style.address}__layout__half`}>{zipcodeInput}</div>
                </div>
                <div>
                  <div className={`${style.address}__layout__whole`}>{companyInput}</div>
                </div>
              </>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <div id={id}>
      {title && <div className={`${style.address}__title`}>{title}</div>}

      <form
        name="Address"
        className={`${style.address}__form`}
        onSubmit={handleSubmit(onFormSubmit)}
        onChange={() => {
          const isChanged = !isEqual(getValues(), formValues);
          onChange && onChange(getValues(), isChanged);
        }}
      >
        <div className={`${style.address}__layout`}>{formLayout}</div>
        <div className={classNames(`${style.address}__btn`)}>
          <a role="button" className={`${style.address}__btn__cancel`} disabled={processing} onClick={cancelHandler}>
            Cancel
          </a>

          <div className={`${style.address}__btn__submit`}>
            <ArrowBtn
              type="submit"
              text="Save"
              loading={processing}
              disabled={processing}
              className={`${style.address}__btn__submit__button`}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
AddressForm.propTypes = {
  title: PropTypes.string,
  address: PropTypes.object.isRequired,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  mode: PropTypes.string, // can be 'partial-edit' or 'edit'
  id: PropTypes.string,
  onChange: PropTypes.func,
};

AddressForm.defaultProps = {
  mode: 'edit',
};

AddressForm.contextTypes = {
  frame: PropTypes.object,
};

export default AddressForm;
