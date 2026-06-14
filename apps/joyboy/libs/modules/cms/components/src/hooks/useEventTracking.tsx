'use client';
import { type Tracking, type TargetElementSelector } from '@castlery/modules-cms-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect, useMemo } from 'react';
import { trackingCmsEvent } from '@castlery/modules-tracking-services';

const getElement = ({ type, slug }: TargetElementSelector) => {
  switch (type) {
    case 'id':
      return document.querySelector(`#${slug}`);
    case 'class':
      return document.querySelector(`.${slug}`);
    case 'tag':
      return document.querySelector(slug);
    default:
      return null;
  }
};

export enum EventType {
  onClick = 'onClick',
  onChange = 'onChange',
}

interface UseEventTrackingParams {
  tracking: Tracking[];
}

/**
 * 用于自定义事件，而非CMS组件内的内置事件，对应CMS Block Library中的tracking_block_template，可在任何组件或者页面中使用
 * 比如add_to_cart等事件会内置到组件中，
 * 当生产运营过程中，产生一些自定义事件，比如点击某个按钮，跟踪自定义事件内容等
 * @param param0
 * @returns
 */
export function useEventTracking({ tracking }: UseEventTrackingParams) {
  const dispatch = useAppDispatch();

  const events = useMemo(
    () =>
      tracking.map((item) => {
        const { target_element_selector, event_type, event_detail } = item;
        return {
          selector: () => getElement(target_element_selector[0]),
          type: event_type,
          handler: async () => {
            // const { endpoint_name, data_template, customed_data } = event_detail[0];
            await dispatch(trackingCmsEvent, { ...event_detail[0] });
          },
        };
      }),
    [tracking, dispatch]
  );

  useEffect(() => {
    if (!events.length) return;
    events.forEach(({ selector, type, handler }) => {
      const ele = selector() ? selector() : document;
      ele?.addEventListener(type, handler);
    });
    return () => {
      events.forEach(({ selector, type, handler }) => {
        const ele = selector() ? selector() : document;
        ele?.removeEventListener(type, handler);
      });
    };
  }, [events]);
  return null;
}

export default useEventTracking;

// {
//   story: {
//     name: 'Menu Variant A',
//     created_at: '2024-08-29T07:07:41.200Z',
//     published_at: null,
//     id: 10894264,
//     uuid: 'e8d974dd-c548-4890-8b06-10910bf36df9',
//     content: {
//       _uid: 'f19148b5-bb3c-4db2-9130-ad277812f909',
//       body: [
//         {
//           _uid: 'b39b2efb-ff1b-48f6-a544-7063652075e9',
//           title: 'Menu A',
//           cms_slug: 'menu_a',
//           tracking: [
//             {
//               _uid: 'cfb5fc45-445c-45c8-a125-4de0d6d49d73',
//               component: 'tracking_block_template',
//               event_type: 'onClick',
//               event_detail: [
//                 {
//                   _uid: '8f45a368-bf42-4e8b-999e-c1b6aaa102ea',
//                   component: 'tracking_event_detail_template',
//                   event_name: 'menu_selected',
//                   customed_data: [],
//                   data_template: 'Customed',
//                   endpoint_name: 'GA',
//                   _editable:
//                     '\u003c!--#storyblok#{"name": "tracking_event_detail_template", "space": "1021147", "uid": "8f45a368-bf42-4e8b-999e-c1b6aaa102ea", "id": "10894264"}--\u003e',
//                 },
//               ],
//               target_element_selector: [
//                 {
//                   _uid: 'f89a6394-1450-4bac-aefd-4f4b0a38380b',
//                   slug: 'atc_button',
//                   type: 'id',
//                   component: 'element_selector',
//                   _editable:
//                     '\u003c!--#storyblok#{"name": "element_selector", "space": "1021147", "uid": "f89a6394-1450-4bac-aefd-4f4b0a38380b", "id": "10894264"}--\u003e',
//                 },
//               ],
//               _editable:
//                 '\u003c!--#storyblok#{"name": "tracking_block_template", "space": "1021147", "uid": "cfb5fc45-445c-45c8-a125-4de0d6d49d73", "id": "10894264"}--\u003e',
//             },
//             {
//               _uid: '5f03f6d6-e156-4d7c-bb66-80a95ad6b9e3',
//               component: 'tracking_block_template',
//               event_type: 'onChange',
//               event_detail: [
//                 {
//                   _uid: '679ca40b-a352-4ddf-86fc-c09e51e1e1f6',
//                   component: 'tracking_event_detail_template',
//                   event_name: 'change_menu',
//                   customed_data: [],
//                   data_template: 'Customed',
//                   endpoint_name: 'FB',
//                   _editable:
//                     '\u003c!--#storyblok#{"name": "tracking_event_detail_template", "space": "1021147", "uid": "679ca40b-a352-4ddf-86fc-c09e51e1e1f6", "id": "10894264"}--\u003e',
//                 },
//               ],
//               target_element_selector: [
//                 {
//                   _uid: 'ecfe336f-4c3a-43f2-a963-c06d63c11bfe',
//                   slug: 'atc_button',
//                   type: 'id',
//                   component: 'element_selector',
//                   _editable:
//                     '\u003c!--#storyblok#{"name": "element_selector", "space": "1021147", "uid": "ecfe336f-4c3a-43f2-a963-c06d63c11bfe", "id": "10894264"}--\u003e',
//                 },
//               ],
//               _editable:
//                 '\u003c!--#storyblok#{"name": "tracking_block_template", "space": "1021147", "uid": "5f03f6d6-e156-4d7c-bb66-80a95ad6b9e3", "id": "10894264"}--\u003e',
//             },
//           ],
//           component: 'menu_variant',
//           menu_component_data: [
//             {
//               _uid: '3668d89a-b54a-4309-ba93-791b12f16b13',
//               slug: 'new',
//               blocks: [],
//               component: 'menu_item',
//               _editable:
//                 '\u003c!--#storyblok#{"name": "menu_item", "space": "1021147", "uid": "3668d89a-b54a-4309-ba93-791b12f16b13", "id": "10894264"}--\u003e',
//             },
//           ],
//           _editable:
//             '\u003c!--#storyblok#{"name": "menu_variant", "space": "1021147", "uid": "b39b2efb-ff1b-48f6-a544-7063652075e9", "id": "10894264"}--\u003e',
//         },
//       ],
//       component: 'page',
//       _editable:
//         '\u003c!--#storyblok#{"name": "page", "space": "1021147", "uid": "f19148b5-bb3c-4db2-9130-ad277812f909", "id": "10894264"}--\u003e',
//     },
//     slug: 'menu-variant-a',
//     full_slug: 'menu-collection/menu-variant-a',
//     sort_by_date: null,
//     position: 0,
//     tag_list: [],
//     is_startpage: false,
//     parent_id: 10894263,
//     meta_data: null,
//     group_id: '05c0c798-05ac-4801-8def-dfaa303ed75f',
//     first_published_at: null,
//     release_id: null,
//     lang: 'default',
//     path: null,
//     alternates: [],
//     default_full_slug: null,
//     translated_slugs: null,
//   },
//   cv: 1725258081,
//   rels: [],
//   links: [],
// };
