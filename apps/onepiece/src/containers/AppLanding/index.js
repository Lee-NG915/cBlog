import React from 'react';
import Fade from 'react-reveal/Fade';
import Bounce from 'react-reveal/Bounce';
import Rotate from 'react-reveal/Rotate';
import { useInView } from 'react-intersection-observer';

import Banner from 'components/Banner';
import AppStore from 'components/AppStore';
import { wrapPage } from 'utils/page';
import { renderImage } from 'utils/image';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Container } from '@castlery/fortress';
import { globalFeatureInSG, globalFeatureInUS } from 'config';
import style from './style.scss';

const visualize = globalFeatureInUS ? 'visualize' : 'visualise';
const color = globalFeatureInUS ? 'color' : 'colour';
const imageSuffix = globalFeatureInSG ? '' : `-${__COUNTRY__.toLowerCase()}`;

const steps = [
  {
    imageUrl: `/static/app-landing/step1${imageSuffix}.jpg`,
    intro: 'Select an item to view it in your space.',
  },
  {
    imageUrl: '/v1587093387/static/app-landing/step2.jpg',
    intro: 'Scan the room.',
  },
  {
    imageUrl: `/static/app-landing/step3${imageSuffix}.jpg`,
    intro: 'Rotate, move and place the item wherever you like.',
  },
  {
    imageUrl: '/v1587093389/static/app-landing/step4.jpg',
    intro: 'Add multiple items to see how they match.',
  },
];

const faqs = [
  {
    faqs: [
      {
        question: 'Can I use the AR feature to check if the product fits in my space?',
        answer: `With proper usage, the AR feature is a great tool to ${visualize} whether our products fit in your space. Our products show up true-to-scale, allowing you to get a good sense of their size and proportion. However, this is dependent on proper usage of the feature and other environmental factors such as lighting. <br/> <br/> We encourage you to double-check the exact measurements of the product and the space you intend to furnish before you purchase.`,
      },
      {
        question: 'How accurate is the product’s appearance in AR?',
        answer: `The products shown in AR are true-to-scale, which means you can get a realistic sense of its true size in your home. The 3D models of our products also offer a visual representation of design details, texture and ${color}.<br /> <br /> Please note that ${color} and texture depend on factors such as the lighting in your space, device display settings and proper usage of the AR feature.  <br /> <br /> Certain products are also designed to feature the natural, rustic beauty of wood materials. Therefore, the actual piece delivered to you will feature unique ${color} variations, knots and nicks.`,
      },
      {
        question: `What is the best way to ${visualize} fabric ${color}s?`,
        answer: `The appearance of fabric ${color}s may vary depending on the lighting conditions in your space, device display settings and other factors. The AR function offers a way to ${visualize} how the product may look like, however we also recommend ordering our free fabric swatches to view in your home.`,
      },
      {
        question: 'Are all your products available on AR?',
        answer:
          'We currently support AR for a wide range of our best-sellers and will be adding more products soon. Keep your app updated to enjoy the latest features!',
      },
      {
        question: 'What devices are compatible with the app?',
        answer:
          'The app can be accessed on any Apple device with iOS 11 and above. However, the AR feature can only be accessed by iPhone 6s and later, iPad (2017 and later), and iPad Pro models.',
      },
      {
        question: 'I am using an iOS version below 11. Can I still use the app?',
        answer: 'No. You will need to upgrade your iOS to version 11 in order to download the app.',
      },
      {
        question: 'Is your app on Android?',
        answer: 'No, but stay tuned! We plan to offer our app on Android devices in the future.',
      },
      {
        question: 'I’m having technical issues while using your app. How can I submit feedback?',
        answer:
          'For app issues or suggestions, please submit them via ‘Feedback for the App’ under the in-app settings. Alternatively, you can Live Chat with us from 10am – 10pm daily, should you have any urgent queries.',
      },
    ],
  },
];

const AppLanding = () => {
  const { desktop } = useBreakpoints();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 1,
  });
  return (
    <div className={style.app}>
      <Container>
        <Banner
          className={`${style.app}__banner`}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/static/app-landing/banner-mobile.jpg',
              loader: {
                ratio: 0.8133,
              },
            },
            {
              breakpoint: 'md',
              srcset: '/static/app-landing/banner.jpg',
              loader: {
                ratio: 0.3125,
              },
            },
          ]}
          lazy={false}
          title="Furnish easier in just a few taps."
        >
          <div className={`${style.app}__header`}>
            <h1 className={`${style.app}__header-title`}>Furnish easier in just a few taps.</h1>
            <AppStore className={`${style.app}__header-badge`} />
          </div>
        </Banner>
        <div className={`${style.app}__intro`}>
          <div className={`${style.app}__intro-detail`}>
            It's now possible with our brand new, all-in-one shopping app, {desktop ? <br /> : ''}
            powered by augmented reality (AR).
          </div>
        </div>

        <Container maxWidth="md">
          <div className={`${style.app}__container`}>
            <div className={`${style.app}__ar`} ref={ref}>
              <div className={`${style.app}__ar-body`}>
                <h2 className={`${style.app}__title`}>{globalFeatureInUS ? 'Visualize' : 'Visualise'} in real life.</h2>
                <div className={`${style.app}__desc`}>
                  Project, rotate and add multiple designs to see how they look in your space — all thanks to
                  true-to-scale AR capabilities. Walk closer to view intricate details such as fabric, leather and wood
                  textures.
                </div>
              </div>
              <div className={`${style.app}__ar-image`}>
                <div className={`${style.app}__ar-background`}>
                  {renderImage('/static/app-landing/ar-background.jpg', 0.52, desktop ? 0.5 : 1, {
                    alt: 'AR Background',
                  })}
                </div>
                <Fade left when={inView}>
                  <div className={`${style.app}__ar-phone`}>
                    {renderImage(`/static/app-landing/ar-phone${imageSuffix}.png`, 1.885, desktop ? 0.25 : 0.5, {
                      alt: 'AR Phone',
                    })}
                  </div>
                </Fade>
                <Bounce top delay={500} when={inView}>
                  <div className={`${style.app}__ar-sofa`}>
                    {renderImage('/static/app-landing/ar-sofa.png', 0.9045, desktop ? 0.25 : 0.5, {
                      alt: 'AR Sofa',
                    })}
                  </div>
                </Bounce>
                <div className={`${style.app}__ar-badge`}>
                  {renderImage('/v1587314476/static/app-landing/ar-badge.png', 1, 0.25, { alt: 'AR Badge' })}
                </div>
              </div>
            </div>

            <div className={`${style.app}__steps`}>
              {steps.map((step, index) => (
                <div key={index} className={`${style.app}__step`}>
                  {renderImage(step.imageUrl, 1.2681, desktop ? 0.25 : 0.5, { alt: `step${index}` })}
                  <div className={`${style.app}__step-intro`}>{step.intro}</div>
                </div>
              ))}
            </div>

            <div className={`${style.app}__wishlist`}>
              <div className={`${style.app}__wishlist-body`}>
                <h2 className={`${style.app}__title`}>Build your dream home.</h2>
                <div className={`${style.app}__desc`}>
                  Loving your virtual home? Add your projected items to your wish list or cart with ease. Or, capture
                  screenshots and share them with friends and family.
                </div>
              </div>
              <div className={`${style.app}__wishlist-image`}>
                {renderImage(
                  `/static/app-landing/build-your-dream-home${imageSuffix}${!desktop ? '-mobile' : ''}.jpg`,
                  !desktop ? 1.2533 : 0.7226,
                  !desktop ? 1 : 0.5,
                  { alt: 'Build you dream home' }
                )}
              </div>
            </div>

            <div className={`${style.app}__shop`}>
              <div className={`${style.app}__shop-body`}>
                <h2 className={`${style.app}__title`}>Shop seamlessly at every step.</h2>
                <div className={`${style.app}__desc`}>
                  Browse, build your wish list and checkout in seconds — anytime, anywhere. <br />
                  <br />
                  Plus, view your order history and earn vouchers in just a few taps!{' '}
                </div>
              </div>
              <div className={`${style.app}__shop-image`}>
                <Rotate top right fraction={0.9}>
                  <div className={`${style.app}__shop-category`}>
                    {renderImage(`/static/app-landing/shop-category${imageSuffix}.png`, 0.6035, desktop ? 0.5 : 1, {
                      alt: 'Shop Category',
                    })}
                  </div>
                </Rotate>
                <Rotate top right fraction={0.9} delay={500}>
                  <div className={`${style.app}__shop-cart`}>
                    {renderImage(`/static/app-landing/shop-cart${imageSuffix}.png`, 0.6812, desktop ? 0.5 : 1, {
                      alt: 'Shop Cart',
                    })}
                  </div>
                </Rotate>
                <Rotate top right fraction={0.9} delay={1000}>
                  <div className={`${style.app}__shop-review`}>
                    {renderImage('/static/app-landing/shop-review.png', 0.6812, desktop ? 0.5 : 1, {
                      alt: 'Shop Review',
                    })}
                  </div>
                </Rotate>
              </div>
            </div>
          </div>
        </Container>

        <Banner
          className={`${style.app}__last-banner`}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1587113522/static/app-landing/footer-banner-mobile.jpg',
              loader: {
                ratio: 1.0666,
              },
            },
            {
              breakpoint: 'md',
              srcset: '/v1587113523/static/app-landing/footer-banner.jpg',
              loader: {
                ratio: 0.3125,
              },
            },
          ]}
          lazy={false}
          title="Your dream home at your fingertips"
        >
          <div className={`${style.app}__footer`}>
            <h1 className={`${style.app}__footer-title`}>Your Dream Home</h1>
            <div className={`${style.app}__footer-desc`}>at your fingertips</div>
            <AppStore className={`${style.app}__footer-badge`} />
          </div>
        </Banner>
      </Container>
    </div>
  );
};

export default wrapPage()(AppLanding);
