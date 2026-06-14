import { ImageImplement } from '../components/ImageImplement';
import { POTips } from '../components/POTips';

const formFieldsByMarket = {
  SG: [
    [
      {
        fieldKey: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'Enter First Name',
        errorText: 'This field is mandatory',
      },
      {
        fieldKey: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        placeholder: 'Enter Last Name',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'phone_number',
        label: 'Contact Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter Contact Number (no space or dash)',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid phone number.',
        hiddenConditions: {
          type: ['Data Privacy'],
        },
      },
      {
        fieldKey: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter Email Address',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid email.',
      },
    ],
    [
      {
        fieldKey: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          'Sales / Product Enquiry': 'Sales / Product Enquiry',
          'Shipping / Order Status': 'Shipping / Order Status',
          'Change / Cancel My Order': 'Change / Cancel My Order',
          'Damages / Repairs': 'Damages / Repairs',
          'Request Return': 'Request Return',
          'Price Protection': 'Price Protection',
          'Feedback / Suggestions': 'Feedback / Suggestions',
          'Data Privacy': 'Data Privacy',
          'Other Enquiry': 'Other Enquiry',
        },
      },
    ],
    [
      {
        fieldKey: 'order_number',
        label: 'Order Number(Optional)',
        type: 'order_number',
        required: false,
        placeholder: 'Enter Order Number',
        helperText: 'Please provide a valid order number.',
        hiddenConditions: {
          type: [
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Data Privacy',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a reason',
          'Customer - Product': 'I would like to change / remove a product / service from my order',
          'Customer - Address': 'I would like to change my delivery address',
          'Customer - Combine Order': 'I would like to combine with another existing order',
          'Customer - Sales': 'The product/s that I have purchased is currently on sale',
          'Customer - Payment': 'I would like to change my payment method',
          'Customer - Delivery TAT': 'The estimated delivery time is too long',
          'Remorse - Remorse': 'I have changed my mind',
          Others: 'Others',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a reason',
          'Issue – Quality': "The colour or material doesn't suit my home",
          'Issue - Quality (Comfort)': 'I wanted something softer / firmer',
          'Issue - Quality (Size)': 'It doesn’t fit my space ',
          Others: 'Others',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
      },
    ],
    [
      {
        fieldKey: 'reason_other',
        label: 'Please specify your reason',
        type: 'text',
        required: true,
        placeholder: 'specify your reason',
        errorText: 'This field is mandatory',
        mustDisplayConditions: {
          reason: ['Others'],
        },
      },
    ],
    [
      {
        fieldKey: 'order_number1',
        label: 'Order Number',
        type: 'order_number',
        required: true,
        placeholder: 'Enter Order Number',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid order number.',
        hiddenConditions: {
          type: ['Sales / Product Enquiry', 'Data Privacy', 'Feedback / Suggestions', 'Other Enquiry'],
        },
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a data subject request',
          'Request to Delete': 'Request to Delete',
          'Request to Correct': 'Request to Correct',
          'Request to Know/Access - Categories Report': 'Request to Know/Access - Categories Report',
          'Request to Know/Access - Specific Pieces Report': 'Request to Know/Access - Specific Pieces Report',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
        selectOptionsImplement: {
          'Request to Delete': '(Request that we delete personal data we maintain about you)',
          'Request to Correct': '(Request that we correct inaccurate personal data we maintain about you)',
          'Request to Know/Access - Categories Report':
            '(Request to know the categories of personal data we have about you and how we use and disclose it)',
          'Request to Know/Access - Specific Pieces Report':
            '(Request to know the specific pieces of personal data we maintain about you)',
        },
      },
    ],
    [
      {
        fieldKey: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Enter Subject',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'comment',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Enter Message Details',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'image_urls_in_cancel',
        label: 'Please note that we would require photos of the item you received for our own records',
        type: 'images',
        required: false,
        imageList: ['Full view', 'Angled view', 'Close-up view'],
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'image_urls_in_return',
        label: 'Please note that we would require photos of the item you received for our own records',
        type: 'images',
        required: false,
        imageList: ['Front view', 'Top', 'Angled Right', 'Angled Left', 'Back View'],
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'render_tips',
        type: 'render_tips',
        required: false,
        renderElement: (
          <ImageImplement
            title="Examples of required photo angles:"
            description="Place a coin next to the defective area for size reference."
            imageList={[
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/full-view-v2.jpg',
                alt: 'Full View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/angled-view-v2.jpg',
                alt: 'Angled View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/close-up-view-v2.jpg',
                alt: 'Close-up View',
              },
            ]}
          />
        ),
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'render_tips2',
        type: 'render_tips',
        required: false,
        renderElement: (
          <ImageImplement
            title="Please take a photo of the furniture with these few angles"
            imageList={[
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-front-view.jpg',
                alt: 'Front View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-top-view.jpg',
                alt: 'Top',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-angledRight-view.jpg',
                alt: 'Angled Right',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-angledLeft-view.jpg',
                alt: 'Angled Left',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-back-view.jpg',
                alt: 'Back View',
              },
            ]}
          />
        ),
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
  ],
  US: [
    [
      {
        fieldKey: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'Enter First Name',
        errorText: 'This field is mandatory',
      },
      {
        fieldKey: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        placeholder: 'Enter Last Name',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'phone_number',
        label: 'Contact Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter Contact Number',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid phone number.',
        hiddenConditions: {
          type: ['Data Privacy'],
        },
        imaskProps: {
          mask: '(000) 000-0000',
        },
      },
      {
        fieldKey: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter Email Address',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid email.',
      },
    ],
    [
      {
        fieldKey: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          'Sales / Product Enquiry': 'Sales / Product Enquiry',
          'Shipping / Order Status': 'Shipping / Order Status',
          'Change / Cancel My Order': 'Change / Cancel My Order',
          'Damages / Repairs': 'Damages / Repairs',
          'Request Return': 'Request Return',
          'Price Protection': 'Price Protection',
          'Feedback / Suggestions': 'Feedback / Suggestions',
          'Data Privacy': 'Data Privacy',
          'Other Enquiry': 'Other Enquiry',
        },
      },
    ],
    [
      {
        fieldKey: 'order_number',
        label: 'Order Number(Optional)',
        type: 'order_number',
        required: false,
        placeholder: 'Enter Order Number',
        helperText: 'Please provide a valid order number.',
        hiddenConditions: {
          type: [
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Data Privacy',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a reason',
          'Customer - Product': 'I would like to change / remove a product / service from my order',
          'Customer - Address': 'I would like to change my delivery address',
          'Customer - Combine Order': 'I would like to combine with another existing order',
          'Customer - Sales': 'The product/s that I have purchased is currently on sale',
          'Customer - Payment': 'I would like to change my payment method',
          'Customer - Delivery TAT': 'The estimated delivery time is too long',
          'Remorse - Remorse': 'I have changed my mind',
          Others: 'Others',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a reason',
          'Issue – Quality': "The color or material doesn't suit my home",
          'Issue - Quality (Comfort)': 'I wanted something softer / firmer',
          'Issue - Quality (Size)': 'It doesn’t fit my space ',
          Others: 'Others',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
      },
    ],
    [
      {
        fieldKey: 'reason_other',
        label: 'Please specify your reason',
        type: 'text',
        required: true,
        placeholder: 'specify your reason',
        errorText: 'This field is mandatory',
        mustDisplayConditions: {
          reason: ['Others'],
        },
      },
    ],
    [
      {
        fieldKey: 'order_number1',
        label: 'Order Number',
        type: 'order_number',
        required: true,
        placeholder: 'Enter Order Number',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid order number.',
        hiddenConditions: {
          type: ['Sales / Product Enquiry', 'Data Privacy', 'Feedback / Suggestions', 'Other Enquiry'],
        },
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a data subject request',
          'Request to Delete': 'Request to Delete',
          'Request to Correct': 'Request to Correct',
          'Request to Know/Access - Categories Report': 'Request to Know/Access - Categories Report',
          'Request to Know/Access - Specific Pieces Report': 'Request to Know/Access - Specific Pieces Report',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
        selectOptionsImplement: {
          'Request to Delete': '(Request that we delete personal data we maintain about you)',
          'Request to Correct': '(Request that we correct inaccurate personal data we maintain about you)',
          'Request to Know/Access - Categories Report':
            '(Request to know the categories of personal data we have about you and how we use and disclose it)',
          'Request to Know/Access - Specific Pieces Report':
            '(Request to know the specific pieces of personal data we maintain about you)',
        },
      },
    ],
    [
      {
        fieldKey: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Enter Subject',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'comment',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Enter Message Details',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'po_number',
        label: 'PO Number(Optional, locate it on the packaging)',
        type: 'text_with_tips',
        required: false,
        placeholder: 'Enter PO Number',
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        endDecorator: <POTips />,
      },
    ],
    [
      {
        fieldKey: 'image_urls_in_cancel',
        label: 'Please note that we would require photos of the item you received for our own records',
        type: 'images',
        required: false,
        imageList: ['Full view', 'Angled view', 'Close-up view'],
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'image_urls_in_return',
        label: 'Please note that we would require photos of the item you received for our own records',
        type: 'images',
        required: false,
        imageList: ['Front view', 'Top', 'Angled Right', 'Angled Left', 'Back View'],
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'render_tips',
        type: 'render_tips',
        required: false,
        renderElement: (
          <ImageImplement
            title="Examples of required photo angles:"
            description="Place a coin next to the defective area for size reference."
            imageList={[
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/full-view-v2.jpg',
                alt: 'Full View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/angled-view-v2.jpg',
                alt: 'Angled View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/close-up-view-v2.jpg',
                alt: 'Close-up View',
              },
            ]}
          />
        ),
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'render_tips2',
        type: 'render_tips',
        required: false,
        renderElement: (
          <ImageImplement
            title="Please take a photo of the furniture with these few angles"
            imageList={[
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-front-view.jpg',
                alt: 'Front View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-top-view.jpg',
                alt: 'Top',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-angledRight-view.jpg',
                alt: 'Angled Right',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-angledLeft-view.jpg',
                alt: 'Angled Left',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-back-view.jpg',
                alt: 'Back View',
              },
            ]}
          />
        ),
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
  ],
  AU: [
    [
      {
        fieldKey: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'Enter First Name',
        errorText: 'This field is mandatory',
      },
      {
        fieldKey: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        placeholder: 'Enter Last Name',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'phone_number',
        label: 'Contact Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter Contact Number (no space or dash)',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid phone number.',
        hiddenConditions: {
          type: ['Data Privacy'],
        },
      },
      {
        fieldKey: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter Email Address',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid email.',
      },
    ],
    [
      {
        fieldKey: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          'Sales / Product Enquiry': 'Sales / Product Enquiry',
          'Shipping / Order Status': 'Shipping / Order Status',
          'Change / Cancel My Order': 'Change / Cancel My Order',
          'Damages / Repairs': 'Damages / Repairs',
          'Request Return': 'Request Return',
          'Price Protection': 'Price Protection',
          'Feedback / Suggestions': 'Feedback / Suggestions',
          'Data Privacy': 'Data Privacy',
          'Other Enquiry': 'Other Enquiry',
        },
      },
    ],
    [
      {
        fieldKey: 'order_number',
        label: 'Order Number(Optional)',
        type: 'order_number',
        required: false,
        placeholder: 'Enter Order Number',
        helperText: 'Please provide a valid order number.',
        hiddenConditions: {
          type: [
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Data Privacy',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a reason',
          'Customer - Product': 'I would like to change / remove a product / service from my order',
          'Customer - Address': 'I would like to change my delivery address',
          'Customer - Combine Order': 'I would like to combine with another existing order',
          'Customer - Sales': 'The product/s that I have purchased is currently on sale',
          'Customer - Payment': 'I would like to change my payment method',
          'Customer - Delivery TAT': 'The estimated delivery time is too long',
          'Remorse - Remorse': 'I have changed my mind',
          Others: 'Others',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a reason',
          'Issue – Quality': "The colour or material doesn't suit my home",
          'Issue - Quality (Comfort)': 'I wanted something softer / firmer',
          'Issue - Quality (Size)': 'It doesn’t fit my space ',
          Others: 'Others',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
      },
    ],
    [
      {
        fieldKey: 'reason_other',
        label: 'Please specify your reason',
        type: 'text',
        required: true,
        placeholder: 'specify your reason',
        errorText: 'This field is mandatory',
        mustDisplayConditions: {
          reason: ['Others'],
        },
      },
    ],
    [
      {
        fieldKey: 'order_number1',
        label: 'Order Number',
        type: 'order_number',
        required: true,
        placeholder: 'Enter Order Number',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid order number.',
        hiddenConditions: {
          type: ['Sales / Product Enquiry', 'Data Privacy', 'Feedback / Suggestions', 'Other Enquiry'],
        },
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a data subject request',
          'Request to Delete': 'Request to Delete',
          'Request to Correct': 'Request to Correct',
          'Request to Know/Access - Categories Report': 'Request to Know/Access - Categories Report',
          'Request to Know/Access - Specific Pieces Report': 'Request to Know/Access - Specific Pieces Report',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
        selectOptionsImplement: {
          'Request to Delete': '(Request that we delete personal data we maintain about you)',
          'Request to Correct': '(Request that we correct inaccurate personal data we maintain about you)',
          'Request to Know/Access - Categories Report':
            '(Request to know the categories of personal data we have about you and how we use and disclose it)',
          'Request to Know/Access - Specific Pieces Report':
            '(Request to know the specific pieces of personal data we maintain about you)',
        },
      },
    ],
    [
      {
        fieldKey: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Enter Subject',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'comment',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Enter Message Details',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'po_number',
        label: 'PO Number(Optional, locate it on the packaging)',
        type: 'text_with_tips',
        required: false,
        placeholder: 'Enter PO Number',
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        endDecorator: <POTips />,
      },
    ],
    [
      {
        fieldKey: 'image_urls_in_cancel',
        label: 'Please note that we would require photos of the item you received for our own records',
        type: 'images',
        required: false,
        imageList: ['Full view', 'Angled view', 'Close-up view'],
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'image_urls_in_return',
        label: 'Please note that we would require photos of the item you received for our own records',
        type: 'images',
        required: false,
        imageList: ['Front view', 'Top', 'Angled Right', 'Angled Left', 'Back View'],
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'render_tips',
        type: 'render_tips',
        required: false,
        renderElement: (
          <ImageImplement
            title="Examples of required photo angles:"
            description="Place a coin next to the defective area for size reference."
            imageList={[
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/full-view-v2.jpg',
                alt: 'Full View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/angled-view-v2.jpg',
                alt: 'Angled View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/close-up-view-v2.jpg',
                alt: 'Close-up View',
              },
            ]}
          />
        ),
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'render_tips2',
        type: 'render_tips',
        required: false,
        renderElement: (
          <ImageImplement
            title="Please take a photo of the furniture with these few angles"
            imageList={[
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-front-view.jpg',
                alt: 'Front View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-top-view.jpg',
                alt: 'Top',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-angledRight-view.jpg',
                alt: 'Angled Right',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-angledLeft-view.jpg',
                alt: 'Angled Left',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-back-view.jpg',
                alt: 'Back View',
              },
            ]}
          />
        ),
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
  ],
  CA: [
    [
      {
        fieldKey: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'Enter First Name',
        errorText: 'This field is mandatory',
      },
      {
        fieldKey: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        placeholder: 'Enter Last Name',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'phone_number',
        label: 'Contact Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter Contact Number',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid phone number.',
        hiddenConditions: {
          type: ['Data Privacy'],
        },
      },
      {
        fieldKey: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter Email Address',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid email.',
      },
    ],
    [
      {
        fieldKey: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          'Sales / Product Enquiry': 'Sales / Product Enquiry',
          'Shipping / Order Status': 'Shipping / Order Status',
          'Change / Cancel My Order': 'Change / Cancel My Order',
          'Damages / Repairs': 'Damages / Repairs',
          'Request Return': 'Request Return',
          'Price Protection': 'Price Protection',
          'Feedback / Suggestions': 'Feedback / Suggestions',
          'Data Privacy': 'Data Privacy',
          'Other Enquiry': 'Other Enquiry',
        },
      },
    ],
    [
      {
        fieldKey: 'order_number',
        label: 'Order Number(Optional)',
        type: 'order_number',
        required: false,
        placeholder: 'Enter Order Number',
        helperText: 'Please provide a valid order number.',
        hiddenConditions: {
          type: [
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Data Privacy',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a reason',
          'Customer - Product': 'I would like to change / remove a product / service from my order',
          'Customer - Address': 'I would like to change my delivery address',
          'Customer - Combine Order': 'I would like to combine with another existing order',
          'Customer - Sales': 'The product/s that I have purchased is currently on sale',
          'Customer - Payment': 'I would like to change my payment method',
          'Customer - Delivery TAT': 'The estimated delivery time is too long',
          'Remorse - Remorse': 'I have changed my mind',
          Others: 'Others',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a reason',
          'Issue – Quality': "The colour or material doesn't suit my home",
          'Issue - Quality (Comfort)': 'I wanted something softer / firmer',
          'Issue - Quality (Size)': 'It doesn’t fit my space ',
          Others: 'Others',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
      },
    ],
    [
      {
        fieldKey: 'reason_other',
        label: 'Please specify your reason',
        type: 'text',
        required: true,
        placeholder: 'specify your reason',
        errorText: 'This field is mandatory',
        mustDisplayConditions: {
          reason: ['Others'],
        },
      },
    ],
    [
      {
        fieldKey: 'order_number1',
        label: 'Order Number',
        type: 'order_number',
        required: true,
        placeholder: 'Enter Order Number',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid order number.',
        hiddenConditions: {
          type: ['Sales / Product Enquiry', 'Data Privacy', 'Feedback / Suggestions', 'Other Enquiry'],
        },
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a data subject request',
          'Request to Delete': 'Request to Delete',
          'Request to Correct': 'Request to Correct',
          'Request to Know/Access - Categories Report': 'Request to Know/Access - Categories Report',
          'Request to Know/Access - Specific Pieces Report': 'Request to Know/Access - Specific Pieces Report',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
        selectOptionsImplement: {
          'Request to Delete': '(Request that we delete personal data we maintain about you)',
          'Request to Correct': '(Request that we correct inaccurate personal data we maintain about you)',
          'Request to Know/Access - Categories Report':
            '(Request to know the categories of personal data we have about you and how we use and disclose it)',
          'Request to Know/Access - Specific Pieces Report':
            '(Request to know the specific pieces of personal data we maintain about you)',
        },
      },
    ],
    [
      {
        fieldKey: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Enter Subject',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'comment',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Enter Message Details',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'po_number',
        label: 'PO Number(Optional, locate it on the packaging)',
        type: 'text_with_tips',
        required: false,
        placeholder: 'Enter PO Number',
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        endDecorator: <POTips />,
      },
    ],
    [
      {
        fieldKey: 'image_urls_in_cancel',
        label: 'Please note that we would require photos of the item you received for our own records',
        type: 'images',
        required: false,
        imageList: ['Full view', 'Angled view', 'Close-up view'],
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'image_urls_in_return',
        label: 'Please note that we would require photos of the item you received for our own records',
        type: 'images',
        required: false,
        imageList: ['Front view', 'Top', 'Angled Right', 'Angled Left', 'Back View'],
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'render_tips',
        type: 'render_tips',
        required: false,
        renderElement: (
          <ImageImplement
            title="Examples of required photo angles:"
            description="Place a coin next to the defective area for size reference."
            imageList={[
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/full-view-v2.jpg',
                alt: 'Full View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/angled-view-v2.jpg',
                alt: 'Angled View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/close-up-view-v2.jpg',
                alt: 'Close-up View',
              },
            ]}
          />
        ),
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'render_tips2',
        type: 'render_tips',
        required: false,
        renderElement: (
          <ImageImplement
            title="Please take a photo of the furniture with these few angles"
            imageList={[
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-front-view.jpg',
                alt: 'Front View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-top-view.jpg',
                alt: 'Top',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-angledRight-view.jpg',
                alt: 'Angled Right',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-angledLeft-view.jpg',
                alt: 'Angled Left',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-back-view.jpg',
                alt: 'Back View',
              },
            ]}
          />
        ),
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
  ],
  UK: [
    [
      {
        fieldKey: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'Enter First Name',
        errorText: 'This field is mandatory',
      },
      {
        fieldKey: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        placeholder: 'Enter Last Name',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'phone_number',
        label: 'Contact Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter Contact Number (no space or dash)',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid phone number.',
        hiddenConditions: {
          type: ['Data Privacy'],
        },
      },
      {
        fieldKey: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter Email Address',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid email.',
      },
    ],
    [
      {
        fieldKey: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          'Sales / Product Enquiry': 'Sales / Product Enquiry',
          'Shipping / Order Status': 'Shipping / Order Status',
          'Change / Cancel My Order': 'Change / Cancel My Order',
          'Damages / Repairs': 'Damages / Repairs',
          'Request Return': 'Request Return',
          'Price Protection': 'Price Protection',
          'Feedback / Suggestions': 'Feedback / Suggestions',
          'Data Privacy': 'Data Privacy',
          'Other Enquiry': 'Other Enquiry',
        },
      },
    ],
    [
      {
        fieldKey: 'order_number',
        label: 'Order Number(Optional)',
        type: 'order_number',
        required: false,
        placeholder: 'Enter Order Number',
        helperText: 'Please provide a valid order number.',
        hiddenConditions: {
          type: [
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Data Privacy',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a reason',
          'Customer - Product': 'I would like to change / remove a product / service from my order',
          'Customer - Address': 'I would like to change my delivery address',
          'Customer - Combine Order': 'I would like to combine with another existing order',
          'Customer - Sales': 'The product/s that I have purchased is currently on sale',
          'Customer - Payment': 'I would like to change my payment method',
          'Customer - Delivery TAT': 'The estimated delivery time is too long',
          'Remorse - Remorse': 'I have changed my mind',
          Others: 'Others',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a reason',
          'Issue – Quality': "The colour or material doesn't suit my home",
          'Issue - Quality (Comfort)': 'I wanted something softer / firmer',
          'Issue - Quality (Size)': 'It doesn’t fit my space ',
          Others: 'Others',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
      },
    ],
    [
      {
        fieldKey: 'reason_other',
        label: 'Please specify your reason',
        type: 'text',
        required: true,
        placeholder: 'specify your reason',
        errorText: 'This field is mandatory',
        mustDisplayConditions: {
          reason: ['Others'],
        },
      },
    ],
    [
      {
        fieldKey: 'order_number1',
        label: 'Order Number',
        type: 'order_number',
        required: true,
        placeholder: 'Enter Order Number',
        errorText: 'This field is mandatory',
        helperText: 'Please provide a valid order number.',
        hiddenConditions: {
          type: ['Sales / Product Enquiry', 'Data Privacy', 'Feedback / Suggestions', 'Other Enquiry'],
        },
      },
    ],
    [
      {
        fieldKey: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        placeholder: 'Select Industry',
        errorText: 'This field is mandatory',
        selectOptions: {
          '': 'Select a data subject request',
          'Request to Delete': 'Request to Delete',
          'Request to Correct': 'Request to Correct',
          'Request to Know/Access - Categories Report': 'Request to Know/Access - Categories Report',
          'Request to Know/Access - Specific Pieces Report': 'Request to Know/Access - Specific Pieces Report',
        },
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Other Enquiry',
          ],
        },
        includeInJson: 'data',
        selectOptionsImplement: {
          'Request to Delete': '(Request that we delete personal data we maintain about you)',
          'Request to Correct': '(Request that we correct inaccurate personal data we maintain about you)',
          'Request to Know/Access - Categories Report':
            '(Request to know the categories of personal data we have about you and how we use and disclose it)',
          'Request to Know/Access - Specific Pieces Report':
            '(Request to know the specific pieces of personal data we maintain about you)',
        },
      },
    ],
    [
      {
        fieldKey: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Enter Subject',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'comment',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Enter Message Details',
        errorText: 'This field is mandatory',
      },
    ],
    [
      {
        fieldKey: 'po_number',
        label: 'PO Number(Optional, locate it on the packaging)',
        type: 'text_with_tips',
        required: false,
        placeholder: 'Enter PO Number',
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
        endDecorator: <POTips />,
      },
    ],
    [
      {
        fieldKey: 'image_urls_in_cancel',
        label: 'Please note that we would require photos of the item you received for our own records',
        type: 'images',
        required: false,
        imageList: ['Full view', 'Angled view', 'Close-up view'],
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'image_urls_in_return',
        label: 'Please note that we would require photos of the item you received for our own records',
        type: 'images',
        required: false,
        imageList: ['Front view', 'Top', 'Angled Right', 'Angled Left', 'Back View'],
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'render_tips',
        type: 'render_tips',
        required: false,
        renderElement: (
          <ImageImplement
            title="Examples of required photo angles:"
            description="Place a coin next to the defective area for size reference."
            imageList={[
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/full-view-v2.jpg',
                alt: 'Full View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/angled-view-v2.jpg',
                alt: 'Angled View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/close-up-view-v2.jpg',
                alt: 'Close-up View',
              },
            ]}
          />
        ),
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Request Return',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
    [
      {
        fieldKey: 'render_tips2',
        type: 'render_tips',
        required: false,
        renderElement: (
          <ImageImplement
            title="Please take a photo of the furniture with these few angles"
            imageList={[
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-front-view.jpg',
                alt: 'Front View',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-top-view.jpg',
                alt: 'Top',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-angledRight-view.jpg',
                alt: 'Angled Right',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-angledLeft-view.jpg',
                alt: 'Angled Left',
              },
              {
                url: 'https://res.cloudinary.com/castlery/image/upload/static/contact-us/return-back-view.jpg',
                alt: 'Back View',
              },
            ]}
          />
        ),
        hiddenConditions: {
          type: [
            'Sales / Product Enquiry',
            'Shipping / Order Status',
            'Change / Cancel My Order',
            'Damages / Repairs',
            'Price Protection',
            'Feedback / Suggestions',
            'Data Privacy',
            'Other Enquiry',
          ],
        },
      },
    ],
  ],
};

export { formFieldsByMarket };
