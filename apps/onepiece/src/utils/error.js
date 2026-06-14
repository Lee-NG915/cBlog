export const spliceByErrorTitle = (error) => {
  if (error.errors && error.errors[0]) {
    if (error.errors[0].title !== 'Base') {
      error.errors[0].detail = `${error.errors[0].title} ${error.errors[0].detail}`;
    }
  }
};
