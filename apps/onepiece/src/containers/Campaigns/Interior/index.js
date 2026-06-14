import React from 'react';
import { withUseBreakpoints, wrapPage } from 'utils/page';
import Banner from 'components/Banner';
import ReactPicture from 'components/ReactPicture';
import { cloudinaryRoot } from 'config';
import Slick from 'react-slick';
import ReactSVG from 'components/ReactSVG';
import lang from 'utils/lang';
import { Container } from '@castlery/fortress';
import PropTypes from 'prop-types';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const PrevBtn = ({ currentSlide, slideCount, ...rest }) => {
  const { desktop } = useBreakpoints();
  if (!desktop) return null;
  return (
    <button {...rest} type="button" aria-label="Show Previous Slides">
      <ReactSVG name="arrow-prev" />
    </button>
  );
};
PrevBtn.propTypes = {
  currentSlide: PropTypes.any,
  slideCount: PropTypes.any,
};
const NextBtn = ({ currentSlide, slideCount, ...rest }) => {
  const { desktop } = useBreakpoints();
  if (!desktop) return null;
  return (
    <button {...rest} type="button" aria-label="Show Next Slides">
      <ReactSVG name="arrow-next" />
    </button>
  );
};
NextBtn.propTypes = {
  currentSlide: PropTypes.any,
  slideCount: PropTypes.any,
};
const demos = [
  `${cloudinaryRoot}/static/interior/demo1.jpg`,
  `${cloudinaryRoot}/static/interior/demo2.jpg`,
  `${cloudinaryRoot}/static/interior/demo3.jpg`,
  `${cloudinaryRoot}/static/interior/demo4.jpg`,
];

@wrapPage()
@withUseBreakpoints
export default class Interior extends React.Component {
  static propTypes = {
    breakpoints: PropTypes.object,
  };

  render() {
    const {
      breakpoints: { desktop },
    } = this.props;
    return (
      <div>
        <Banner
          className={style.banner}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/static/interior/banner-mobile.jpg',
              loader: { ratio: 1.2 },
            },
            {
              breakpoint: 'lg',
              srcset: '/static/interior/banner.jpg',
              loader: { ratio: 0.45 },
            },
          ]}
          lazy={false}
          title="Castlery Interior"
        >
          <div className={`${style.banner}__content`}>
            <h1>Castlery Interior</h1>
            <p>Virtual room design. Real stylists.</p>
          </div>
        </Banner>

        <div className={style.steps}>
          <Container
            fixed
            sx={{
              '& > p': {
                color: '#666',
                textAlign: 'center',
                padding: '0 20%',
                mb: { xs: '30px', md: '50px' },
              },
            }}
          >
            <h2 className={style.title}>How It Works</h2>
            <p>Just 3 simple steps to visualise your new home.</p>
            <div className={`${style.steps}__step`}>
              <div className={`${style.steps}__step__image`}>
                <ReactPicture
                  srcset={`${cloudinaryRoot}/static/interior/step1.jpg`}
                  alt="build your room profile"
                  loader={{ ratio: 0.53 }}
                />
              </div>
              <div className={`${style.steps}__step__text`}>
                <h3>Build Your Room Profile</h3>
                <p>Provide your floor plan and a few photos of your room.</p>
                <div>
                  <span>1</span>
                </div>
              </div>
            </div>
            <div className={`${style.steps}__step`}>
              <div className={`${style.steps}__step__image`}>
                <ReactPicture
                  srcset={`${cloudinaryRoot}/static/interior/step2.jpg`}
                  alt="Describe Your Style"
                  loader={{ ratio: 0.53 }}
                />
              </div>
              <div className={`${style.steps}__step__text`}>
                <h3>Describe Your Style</h3>
                <p>
                  Tell us the style you envision for your interior (wall, flooring, colour theme), and your furniture
                  budget.
                </p>
                <div>
                  <span>2</span>
                </div>
              </div>
            </div>
            <div className={`${style.steps}__step`}>
              <div className={`${style.steps}__step__image`}>
                <ReactPicture
                  srcset={`${cloudinaryRoot}/static/interior/step3.jpg`}
                  alt="Visualise Your Furniture"
                  loader={{ ratio: 0.53 }}
                />
              </div>
              <div className={`${style.steps}__step__text`}>
                <h3>Visualise Your Furniture</h3>
                <p>
                  Select the Castlery products you’d like to visualise in your room. Haven’t decided? We’ll suggest some
                  products that will fit your style and budget.
                </p>
                <div>
                  <span>3</span>
                </div>
              </div>
            </div>
          </Container>
        </div>

        <div className={style.past}>
          <Container fixed>
            <h2 className={style.title}>Our Past Projects</h2>
            <p className={`${style.past}__quote`}>
              “As much as we try to create mood boards, nothing beats actually seeing the vision for our home come to
              life. Being able to see whether the furniture we like suits our theme makes a huge difference!”
            </p>
            <p className={`${style.past}__quoteName`}>– Sheryl Tan</p>
            <Slick
              dots
              infinite
              draggable={false}
              speed={500}
              arrows={desktop}
              prevArrow={desktop && <PrevBtn />}
              nextArrow={desktop && <NextBtn />}
            >
              {demos.map((img, index) => (
                <div key={index}>
                  <ReactPicture srcset={img} alt={`demo ${index}`} loader={{ ratio: 0.555 }} />
                </div>
              ))}
            </Slick>
          </Container>
        </div>

        <div className={style.offer}>
          <Container
            fixed
            sx={{
              m: 0,
              textAlign: 'center',
              fontStyle: 'italic',
              fontWeight: 600,
              p: '0 10%',
              fontSize: { xs: '1.25rem', md: '1.5rem' },
            }}
          >
            <h2 className={style.title}>Available exclusively for just $99</h2>
            <div className={`${style.offer}__detail`}>
              <div>
                <p>3D render of your room</p>
                <p>Design with your favourite Castlery products</p>
                <p>Custom designs based on your style</p>
                <p>2 rounds of design revisions</p>
              </div>
            </div>
            <p>Book your appointment at {lang.t('common.telephone.presentation')} today!</p>
          </Container>
        </div>
      </div>
    );
  }
}
