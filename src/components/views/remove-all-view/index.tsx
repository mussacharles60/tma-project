import '../item-view/index.scss';

import { MdDelete } from 'react-icons/md';

type Props = {
  onClick: () => void;
}

const RemoveAllMediaView = (props: Props) => {
  return (
    <div className='preview also-plus-btn' onClick={props.onClick}>
      <MdDelete className='plus-icon' />
    </div>
  );
}

export default RemoveAllMediaView;