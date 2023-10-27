import './index.scss';

import { useEffect, useRef } from 'react';

import { FaTimesCircle } from 'react-icons/fa';
import { Media } from '../../../models';

type Props = {
  position: number;
  media: Media;
  locked: boolean;
  showTitle: boolean;
  clickTrigger: number;
  onClick: (x: number, y: number) => void;
  onRemoveClick: () => void;
}

const ItemView = (props: Props) => {
  const view = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = () => {
    if (props.media.type === 'video') {
      const video = videoRef.current;
      // const canvas = canvasRef.current;
      if (!video) return;
      // const context = canvas.getContext('2d');
      // if (!context) return;
      // Add an event listener to the video element to wait for the 'loadedmetadata' event
      video.addEventListener('loadeddata', function () {
        // Seek to the desired time position
        video.currentTime = 3;
        // // Wait for the 'seeked' event to ensure that the video has seeked to the desired position
        // video.addEventListener('seeked', function () {
        //   // Draw the current video frame on the canvas
        //   context.drawImage(video, 0, 0, canvas.width, canvas.height);
        //   // Get the canvas data and convert it to a data URL
        //   const dataURL = canvas.toDataURL('image/jpeg');
        //   // Update the state with the thumbnail URL
        //   setThumbnailURL(dataURL);
        // });
      });
      // Load the video source
      video.load();
    }
  }

  useEffect(() => {
    if (props.clickTrigger > 0) {
      if (view.current) {
        view.current.click();
      }
    }
  }, [props.clickTrigger]);

  return (
    <div className='preview'
      id={`preview-${props.position}`}
      onClick={(e) => {
        if (e.target === document.getElementById(`preview-${props.position}`)) {
          props.onClick(e.clientX, e.clientY);
        } else if (e.target === document.getElementById(`preview-${props.position}-center`)) {
          if (view.current) {
            props.onClick(view.current.getBoundingClientRect().x, view.current.getBoundingClientRect().y);
          } else {
            props.onClick(e.clientX, e.clientY);
          }
        }
      }}>
      <div
        className='center-view'
        ref={view}
        id={`preview-${props.position}-center`}
      />
      {!props.locked &&
        <FaTimesCircle
          className='close-btn'
          id={`preview-${props.position}-close-btn`}
          onClick={() => {
            if (props.media.src) {
              URL.revokeObjectURL(props.media.src);
              props.onRemoveClick();
            }
          }} />
      }
      <div
        className='image-lay'
        style={{
          height: props.showTitle ? 'calc(100% - 90px)' : '100%',
          borderBottomLeftRadius: props.showTitle ? '0px' : '16px',
          borderBottomRightRadius: props.showTitle ? '0px' : '16px',
        }}
      >
        {props.media.type === 'video' && props.media.src &&
          <>
            <video
              className='video'
              ref={videoRef}
              muted
              style={{
                borderBottomLeftRadius: props.showTitle ? '0px' : '16px',
                borderBottomRightRadius: props.showTitle ? '0px' : '16px'
              }}>
              <source src={props.media.src} type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          </>
        }
        {props.media.type === 'image' && props.media.src &&
          <img
            className='image'
            src={props.media.src}
            style={{
              borderBottomLeftRadius: props.showTitle ? '0px' : '16px',
              borderBottomRightRadius: props.showTitle ? '0px' : '16px'
            }}
          />
        }
      </div>
      {props.showTitle &&
        <div className='info-lay'>
          <span className='name-text'>{props.media.name}</span>
        </div>
      }
    </div>
  );
}

export default ItemView;