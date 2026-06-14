import React from 'react';
import NiceModal from './BaseModal';
import { Button } from '../../index';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NestedModalsProps {}
let uuid = 0;
const NestedModals: React.FC<NestedModalsProps> = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const modalRef = React.createRef();

  const openMore = () => {
    uuid++;
    setOpen(true);
  };
  const closeMore = () => {
    uuid--;
    setOpen(false);
  };
  return (
    <React.Fragment>
      {!uuid ? (
        <Button variant="outlined" color="neutral" onClick={openMore}>
          Open Nested Modal&nbsp;&nbsp;<b style={{ color: 'green' }}> {uuid || ''} </b>
        </Button>
      ) : (
        <Button variant="primary" sx={{ width: 120, display: 'block', margin: 'auto' }} onClick={openMore}>
          Next
        </Button>
      )}
      <NiceModal
        modalRef={modalRef}
        open={open}
        onClose={closeMore}
        title={
          <>
            Nested Modal&nbsp;&nbsp;<b style={{ color: 'blue' }}> {uuid} </b>
          </>
        }
        showDefaultFooter={false}
      >
        <NestedModals />
      </NiceModal>
    </React.Fragment>
  );
};

export default React.memo(NestedModals);
