import '../item-view/index.scss';

import { BiPlus } from 'react-icons/bi';
import { Media } from '../../../models';
import { useRef } from 'react';

type Props = {
  onMediaSelected: (mediaList: Media[]) => void;
}

const PlusMediaView = (props: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const list: Media[] = [];
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      filesArray.forEach((file: File) => {
        if (file) {
          const src = URL.createObjectURL(file);
          list.push({
            id: src,
            name: file.name.replace(/\.[^/.]+$/, ''),
            type: file.type.startsWith('video') ? 'video' : 'image',
            src,
            clickTrigger: 0,
          });
        }
      });
    }
    if (list.length > 0) {
      props.onMediaSelected(list);
    }
  };

  const handlePlusMediaClick = () => {
    // Trigger the file input click
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className='preview also-plus-btn' onClick={handlePlusMediaClick}>
      <BiPlus className='plus-icon' />
      <input
        type='file'
        multiple
        accept='video/*, image/*'
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={handleMediaChange}
      />
    </div>
  );
}

export default PlusMediaView;