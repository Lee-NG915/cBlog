interface ModalStateType {
  states: string[];
  addState: (state: string) => void;
  removeState: (state: number) => void;
  clearState: () => void;
}

const ModalState: ModalStateType = {
  states: [],
  addState: (state: string) => {
    ModalState.states.push(state);
  },
  removeState: (position = 0) => {
    ModalState.states.splice(position, 1);
  },
  clearState: () => {
    ModalState.states = [];
  },
};

export default ModalState;
