import './index.scss';

import { useEffect, useReducer, useRef, useState } from "react";

import { Media } from "../../models"
import ReactPlayer from 'react-player';

type Props = {
  media: Media;
  loopOne: boolean;
  onEnd: (fromClick: boolean) => void;
}

const Player = (props: Props) => {
  const [_, forceUpdate] = useReducer(x => x + 1, 0);
  const didMount = useRef(false);
  const topView = useRef<HTMLDivElement>(null);
  const cursorTimer = useRef<any>(null);
  const imageTimeout = useRef<any>(null);
  const cursorVisible = useRef(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const playing = useRef(false);

  const keyHandler = (e: KeyboardEvent) => {
    if (!didMount.current) return;
    if (e.key === 'Escape') {
      handleEnded(true);
    }
  }

  useEffect(() => {
    didMount.current = true;
    window.addEventListener('keydown', keyHandler, false);
    setTimeout(() => {
      if (!didMount.current) return;
      handleCusror();
    }, 1000);

    if (imageTimeout.current) {
      clearTimeout(imageTimeout.current);
    }
    startImage();
    return () => {
      didMount.current = false;
      window.removeEventListener('keydown', keyHandler, false);
      if (imageTimeout.current) {
        clearTimeout(imageTimeout.current);
      }
    }
  }, []);

  const startImage = () => {
    if (props.media.type === 'image') {
      imageTimeout.current = setTimeout(() => {
        handleEnded(false);
      }, 5000);
      playing.current = true;
    }
  }

  const handleFullScreen = () => {
    setIsFullScreen(true);
  };

  const handleExitFullScreen = () => {
    setIsFullScreen(false);
  };

  const handlePlay = () => {
    playing.current = true;
  };

  const handlePause = () => {
    playing.current = false;
  };

  const handleEnded = (fromClick: boolean) => {
    playing.current = false;
    if (props.media.type === 'image') {
      if (!props.loopOne) {
        handleExitFullScreen();
        props.onEnd(fromClick);
        didMount.current = false;
      } else {
        if (imageTimeout.current) {
          clearTimeout(imageTimeout.current);
        }
        startImage();
      }
    } else { // video
      if (!props.loopOne) {
        handleExitFullScreen();
        props.onEnd(fromClick);
        didMount.current = false;
      } else {
        // video will auto play due to 'loop' mode is set to true
      }
    }
  };

  const handleCusror = () => {
    if (!didMount.current) return;
    if (cursorTimer.current) clearTimeout(cursorTimer.current);
    if (cursorVisible.current === false) {
      showHideCursor(true);
    }
    cursorTimer.current = setTimeout(() => showHideCursor(false), 3000);
  }

  const showHideCursor = (show: boolean) => {
    if (!didMount.current || !topView.current) return;
    if (cursorTimer.current) clearTimeout(cursorTimer.current);
    cursorTimer.current = null;
    topView.current.style.cursor = show ? "pointer" : "none";
    cursorVisible.current = show;
    forceUpdate();
  }

  return (
    <div className='player'>
      <div className='top-view' ref={topView}
        onMouseMove={handleCusror}
        onClick={() => props.onEnd(true)} />
      {props.media.type === 'video' &&
        <div className='video-lay'>
          {props.media.src &&
            <ReactPlayer
              url={props.media.src}
              playing
              controls={false}
              loop={props.loopOne}
              width={'100%'}
              height={'100%'}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={() => handleEnded(false)}
              onDoubleClick={handleFullScreen}
            />
          }
        </div>
      }
      {props.media.type === 'image' &&
        <div className='image-lay'>
          {props.media.src &&
            <img className='image' src={props.media.src} />
          }
        </div>
      }
    </div>
  );
}

export default Player;
