import React from 'react';
import NiceModal from './BaseModal';
import { Button, Box } from 'fortress';

//----------------------- in progress ----------------------
interface ActionHandler {
  (): void;
}
interface FooterActionsProps {
  back: ActionHandler;
  next: ActionHandler;
}
const DefaultFooterActions: React.FC<FooterActionsProps> = ({ back, next }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <Button variant="secondary" onClick={back}>
        Back
      </Button>
    </Box>
  );
};

interface NestedModalsProps {
  // FooterActions: React.FC<FooterActionsProps>;
}
let uuid = 0;
const NestedModals: React.FC<NestedModalsProps> = ({}, ref) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const modalRef = React.createRef();

  const openMore = () => {
    uuid++;
    setOpen(true);
  };
  const closeMore = () => {
    console.log('-----进来了>>>>');

    uuid--;
    setOpen(false);
  };
  console.log('-----open>>>>', modalRef);
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
