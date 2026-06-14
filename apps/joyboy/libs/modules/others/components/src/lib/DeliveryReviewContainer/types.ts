export type QuestionProps = {
  display: string;
  key: string;
  possible_answers: {
    display: string;
    value: string;
  }[];
  type: string;
};

export type QuestionnaireProps = {
  title: string;
  questions: QuestionProps[];
};

export type DetailProps = {
  carrier_display_name: string;
  delivery_order_number: string;
  products: {
    product_name: string;
    quantity: number;
  }[];
  questionnaire: QuestionnaireProps;
  status: string;
};
