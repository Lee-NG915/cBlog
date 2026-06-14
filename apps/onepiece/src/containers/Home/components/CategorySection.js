import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router';
import SvgIcon from 'components/SvgIcon';
import Banner from 'components/Banner';
import { DualBox, OneDualBox } from 'components/DualBox';
import { useDesktopHover } from 'utils/hooks';
import ReactPicture from 'components/ReactPicture';
import { useBreakpoints } from '@castlery/fortress/hooks';
import style from '../style.scss';

const WHOLE_CATEGORY = 'WholeCategory';
const CATEGORY_TEXT = 'CategoryText';
const CATEGORY_IMAGE = 'CategoryImage';

const ArrowBtn = ({ text, hovered }) => (
  <div
    className={classNames(`${style.category}__arrowBtn`, {
      [`${style.category}__arrowBtn--hover`]: hovered,
    })}
  >
    <span>{text}</span>
    <SvgIcon name="line-right-arrow" />
  </div>
);
ArrowBtn.propTypes = {
  text: PropTypes.string,
  hovered: PropTypes.bool,
};

const SmallCategory = ({ link, images: { mediaQueries, hoverImage }, texts: { name, desc } }) => {
  const { desktop } = useBreakpoints();
  const isMobile = !desktop;
  const element = (hovered) => (
    <Link to={link}>
      <OneDualBox
        leftClassName={`${style.category}__smallLeft`}
        leftComponent={
          isMobile ? (
            <Banner mediaQueries={mediaQueries} title={name} />
          ) : (
            <>
              <Banner
                className={classNames(`${style.category}__basePicture`, {
                  [`${style.category}__basePicture--hover`]: hovered,
                })}
                mediaQueries={mediaQueries}
                title={name}
              />
              <div
                className={classNames(`${style.category}__hoverPicture`, {
                  [`${style.category}__hoverPicture--hover`]: hovered,
                })}
              >
                <ReactPicture
                  srcset={hoverImage.src}
                  loader={{ ratio: hoverImage.ratio }}
                  alt={name}
                  draggable="false"
                />
              </div>
            </>
          )
        }
        rightClassName={classNames(`${style.category}__smallRight`, {
          [`${style.category}__smallRight--hover`]: hovered,
        })}
        rightComponent={<h2>{name}</h2>}
      />
      <ArrowBtn text={desc} hovered={hovered} />
    </Link>
  );
  const [newElement] = useDesktopHover(element);
  return newElement;
};
SmallCategory.propTypes = {
  link: PropTypes.string,
  images: PropTypes.object,
  texts: PropTypes.object,
};

const BigCategory = ({ link, images, texts, containerClassName, leftClassName, rightClassName, whichIsTop }) => {
  const { desktop } = useBreakpoints();
  const isMobile = !desktop;
  const renderBanner = (hovered) =>
    isMobile ? (
      <Banner mediaQueries={images.mediaQueries} title={texts.name} lazy />
    ) : (
      <>
        <Banner
          className={classNames(`${style.category}__basePicture`, {
            [`${style.category}__basePicture--hover`]: hovered,
          })}
          mediaQueries={images.mediaQueries}
          title={texts.name}
          lazy
        />
        <div
          className={classNames(`${style.category}__hoverPicture`, {
            [`${style.category}__hoverPicture--hover`]: hovered,
          })}
        >
          <ReactPicture
            srcset={images.hoverImage.src}
            loader={{ ratio: images.hoverImage.ratio }}
            alt={texts.name}
            draggable="false"
          />
        </div>
      </>
    );

  const element = (hovered) => (
    <DualBox
      href={link}
      containerClassName={containerClassName}
      leftClassName={leftClassName}
      rightClassName={rightClassName}
      leftComponent={
        whichIsTop === 'left' ? (
          renderBanner(hovered)
        ) : (
          <CategoryText name={texts.name} desc={texts.desc} hovered={hovered} />
        )
      }
      rightComponent={
        whichIsTop === 'left' ? (
          <CategoryText name={texts.name} desc={texts.desc} hovered={hovered} />
        ) : (
          renderBanner(hovered)
        )
      }
      whichIsTop={whichIsTop}
    />
  );
  const [newElement] = useDesktopHover(element);
  return newElement;
};

const CategoryText = ({ name, desc, hovered }) => (
  <>
    <div>
      <h2>{name}</h2>
    </div>
    <ArrowBtn text={desc} hovered={hovered} />
  </>
);
CategoryText.propTypes = {
  name: PropTypes.string,
  desc: PropTypes.string,
  hovered: PropTypes.bool,
};

const CategorySection = ({ categoryRows = [] }) => {
  const getMediaQueriesAndHoverImg = useCallback((images) => {
    const {
      src: mobileImg,
      width: mobileWidth,
      height: mobileHeight,
    } = images.find((image) => image.name === 'mobile') || {};
    const {
      src: desktopImg,
      hover_src: hoverSrc,
      width: desktopWidth,
      height: desktopHeight,
    } = images.find((image) => image.name === 'desktop') || {};
    const desktopRatio = desktopHeight / desktopWidth;
    return {
      mediaQueries: [
        {
          breakpoint: 'xs',
          srcset: mobileImg,
          loader: { ratio: mobileHeight / mobileWidth },
        },
        {
          breakpoint: 'lg',
          srcset: desktopImg,
          loader: { ratio: desktopRatio },
        },
      ],
      hoverImage: {
        src: hoverSrc,
        ratio: desktopRatio,
      },
    };
  }, []);
  const getDualBoxes = useCallback(() => {
    if (categoryRows?.length < 0) {
      return [];
    }
    return (
      categoryRows
        ?.map((row) => {
          const { first_category: firstCategory, second_category: secondCategory } = row || {};
          if (!firstCategory || !firstCategory[0]) {
            return null;
          }

          if (!secondCategory || !secondCategory[0]) {
            const { name, desc, link, images, is_image_left: isImageLeft } = firstCategory[0];
            const textPart = {
              type: CATEGORY_TEXT,
              link,
              texts: {
                name,
                desc,
              },
            };
            const imagePart = {
              type: CATEGORY_IMAGE,
              link,
              images: getMediaQueriesAndHoverImg(images),
            };
            return {
              left: isImageLeft ? imagePart : textPart,
              right: isImageLeft ? textPart : imagePart,
            };
          }

          const handleCategory = (category) => ({
            type: WHOLE_CATEGORY,
            link: category[0].link,
            texts: {
              name: category[0].name,
              desc: category[0].desc,
            },
            images: getMediaQueriesAndHoverImg(category[0].images),
          });
          return {
            left: handleCategory(firstCategory),
            right: handleCategory(secondCategory),
          };
        })
        .filter((row) => !!row) || []
    );
  }, [categoryRows, getMediaQueriesAndHoverImg]);

  const renderDualBox = useCallback((box, index) => {
    const { left, right } = box;
    if (left.type === WHOLE_CATEGORY && right.type === WHOLE_CATEGORY) {
      return (
        <DualBox
          key={index}
          leftClassName={`${style.category}__borderItem`}
          rightClassName={`${style.category}__borderItem`}
          leftComponent={<SmallCategory link={left.link} images={left.images} texts={left.texts} />}
          rightComponent={<SmallCategory link={right.link} images={right.images} texts={right.texts} />}
        />
      );
    }
    const texts = left.texts || right.texts;
    const images = left.images || right.images;
    let containerClassName;
    let leftClassName;
    let rightClassName;
    let whichIsTop;
    if (left.type === CATEGORY_TEXT && right.type === CATEGORY_IMAGE) {
      containerClassName = `${style.category}__proportion-1`;
      leftClassName = `${style.category}__borderItem ${style.category}__textBox`;
      rightClassName = `${style.category}__borderItem `;
      whichIsTop = 'right';
    }
    if (left.type === CATEGORY_IMAGE && right.type === CATEGORY_TEXT) {
      containerClassName = `${style.category}__proportion-2`;
      leftClassName = `${style.category}__borderItem`;
      rightClassName = `${style.category}__borderItem ${style.category}__textBox`;
      whichIsTop = 'left';
    }
    if (containerClassName) {
      return (
        <BigCategory
          key={index}
          link={left.link || right.link}
          images={images}
          texts={texts}
          containerClassName={containerClassName}
          leftClassName={leftClassName}
          rightClassName={rightClassName}
          whichIsTop={whichIsTop}
        />
      );
    }
    return null;
  }, []);
  return <div className={`${style.category}`}>{getDualBoxes().map((box, i) => renderDualBox(box, i))}</div>;
};

CategorySection.propTypes = {
  categoryRows: PropTypes.array,
};
export default CategorySection;
