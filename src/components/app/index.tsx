import './index.scss';

import * as serviceWorkerRegistration from '../../serviceWorkerRegistration';

import { FaList, FaLock, FaUnlock } from 'react-icons/fa';
import { TbRepeat, TbRepeatOff, TbRepeatOnce } from 'react-icons/tb';
import { useEffect, useReducer, useRef, useState } from "react";

import ItemView from "../views/item-view";
import { Media } from "../../models";
import Player from '../player';
import PlusMediaView from '../views/add-media-view';
import RemoveAllMediaView from '../views/remove-all-view';

export const app_version = require('../../../package.json').version;

type RepeatType = 'off' | 'one' | 'all';

const App = () => {
  const [_, forceUpdate] = useReducer(x => x + 1, 0);

  const didMount = useRef(false);

  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<(Media & { position: number }) | null>(null);
  const [showTitle, setShowTitle] = useState(true);
  const [locked, setLocked] = useState(false);

  const [repeat, setRepeat] = useState<RepeatType>('off');
  const [play, setPlay] = useState(false);

  const playerContainer = useRef<HTMLDivElement>(null);

  const coords = useRef<{ x: Number, y: number }>({ x: 0, y: 0 });

  const parentRef = useRef<HTMLDivElement>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  useEffect(() => {
    didMount.current = true;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // console.log('[app]: resizeObserver: onResize:');
        checkOverflow();
      }
    });
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
      // Listen for scroll event on the parent container
      parentRef.current.addEventListener('scroll', checkOverflow);
    }
    return () => {
      didMount.current = false;
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current);
        parentRef.current.removeEventListener('scroll', checkOverflow)
      }
    };
  }, []);

  useEffect(() => {
    if (!didMount.current) return;
    if (mediaList.length === 0) {
      setLocked(false);
    }
  }, [mediaList.length]);

  const checkOverflow = () => {
    if (parentRef.current) {
      const isOverflowed =
        parentRef.current.scrollWidth > parentRef.current.clientWidth ||
        parentRef.current.scrollHeight > parentRef.current.clientHeight;
      setIsOverflowed(isOverflowed);
      // console.log('[app]: checkOverflow: isOverflowed:', isOverflowed);
    }
  };

  const onItemClick = (x: number, y: number, media: Media, position: number) => {
    coords.current = { x, y };
    // console.log(coords.current);
    setSelectedMedia(null);
    if (playerContainer.current) {
      playerContainer.current.style.display = 'flex';
      playerContainer.current.style.borderRadius = '32px';
      playerContainer.current.animate(
        [
          {
            width: '0vw',
            height: '0vh',
            'border-radius': '32px',
            top: `${coords.current.y}px`,
            left: `${coords.current.x}px`,
            opacity: 0,
            transform: `scale(0)`
          },
          {
            width: '100vw',
            height: '100vh',
            'border-radius': '0px',
            top: `0`,
            left: `0`,
            opacity: 1,
            transform: 'scale(1)'
          },
        ],
        {
          duration: 1000, // Animation duration in milliseconds
          fill: 'forwards', // Keep the final state of the animation
        }
      ).onfinish = () => {
        if (playerContainer.current) {
          playerContainer.current.style.borderRadius = '0px';
        }
      }
      setTimeout(() => {
        if (!didMount.current) return;
        setSelectedMedia({ ...media, position });
        if (playerContainer.current) {
          playerContainer.current.click();
        }
      }, 800);
    }
  }

  const onPlayerEnd = (fromClick: boolean) => {
    if (playerContainer.current) {
      playerContainer.current.style.borderRadius = '32px';
      playerContainer.current.animate(
        [
          {
            width: '100vw',
            height: '100vh',
            'border-radius': '0px',
            top: `0`,
            left: `0`,
            opacity: 1,
            transform: 'scale(1)'
          },
          {
            width: '0vw',
            height: '0vh',
            'border-radius': '32px',
            top: `${coords.current.y}px`,
            left: `${coords.current.x}px`,
            opacity: 0,
            transform: `scale(0)`
          },
        ],
        {
          duration: 1000, // Animation duration in milliseconds
          fill: 'forwards', // Keep the final state of the animation
        }
      ).onfinish = () => {
        if (!didMount.current) return;
        if (playerContainer.current) {
          playerContainer.current.style.display = 'none';
          playerContainer.current.style.borderRadius = '32px';
        }
        if (!fromClick) {
          if (selectedMedia) {
            const last_media_pos = selectedMedia.position;
            setTimeout(() => {
              if (repeat === 'all') {
                const next_pos = getNextMediaPosition(last_media_pos);
                const media = mediaList.find((_, i) => i === next_pos);
                if (media) {
                  media.clickTrigger++;
                  setMediaList((prevList) => {
                    prevList[next_pos] = media;
                    return prevList;
                  });
                  forceUpdate();
                }
              }
            }, 100);
          }
        }
        setSelectedMedia(null);

      }
    }
  }

  const getNextMediaPosition = (last_pos: number) => {
    let next_pos = 0;
    for (let i = 0; i < mediaList.length; i++) {
      if (i === last_pos) {
        // if (i + 1 < mediaList.length - 1) {
        if (mediaList.findIndex((m, ii) => ii === i + 1) >= 0) {
          next_pos = i + 1;
        }
        break;
      }
    };
    return next_pos;
  }

  const toggleRepeat = () => {
    switch (repeat) {
      case 'off':
        setRepeat('all');
        break;
      case 'one':
        setRepeat('off');
        break;
      case 'all':
        setRepeat('one');
        break;
    }
  }

  return (
    <div className="app-main light">
      <VersionController />
      {/* <img className='bg-image' src={require('../../assets/background.jpg')} /> */}
      <div className='btns-lay'>
        {mediaList.length > 0 &&
          <>
            {repeat === 'all' && <TbRepeat className='btns-btn' onClick={toggleRepeat} />}
            {repeat === 'one' && <TbRepeatOnce className='btns-btn' onClick={toggleRepeat} />}
            {repeat === 'off' && <TbRepeatOff className='btns-btn' onClick={toggleRepeat} />}
            {locked && <FaLock className='btns-btn' onClick={() => setLocked(false)} />}
            {!locked && <FaUnlock className='btns-btn' onClick={() => setLocked(true)} />}
            {!locked && <FaList className='btns-btn' onClick={() => setShowTitle(!showTitle)} />}
          </>
        }
      </div>
      <div className="list-lay" ref={parentRef} style={{ alignContent: isOverflowed ? 'normal' : 'center' }}>
        {mediaList.map((item, i) => {
          return (
            <ItemView
              key={item.id}
              position={i}
              media={item}
              locked={locked}
              showTitle={showTitle}
              clickTrigger={item.clickTrigger}
              onClick={(x, y) => {
                onItemClick(x, y, item, i);
              }}
              onRemoveClick={() => {
                setMediaList((prevList) => {
                  prevList.splice(i, 1);
                  return prevList;
                });
                forceUpdate();
              }}
            />
          )
        })}
        {!locked &&
          <>
            <PlusMediaView
              onMediaSelected={(mediaList) => {
                console.log('[app]: PlusMediaView: onMediaSelected:', mediaList);
                setMediaList((prevList) => {
                  return [...prevList, ...mediaList];
                });
                forceUpdate();
              }}
            />
            {mediaList.length > 0 &&
              <RemoveAllMediaView
                onClick={() => {
                  mediaList.forEach(media => {
                    if (media.src) {
                      URL.revokeObjectURL(media.src);
                    }
                  });
                  setMediaList([]);
                  forceUpdate();
                }}
              />
            }
          </>
        }
      </div>
      <div className='player-lay' ref={playerContainer}>
        {selectedMedia &&
          <Player
            media={selectedMedia}
            loopOne={repeat === 'one'}
            onEnd={onPlayerEnd}
          />
        }
      </div>
    </div>
  );
}

export default App;

const VersionController = () => {

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // check version of localStorage
      const localVersion = localStorage.getItem('app-version');
      if (localVersion !== app_version) {
        setTimeout(() => {
          setTimeout(() => {
            clearAllCaches();
            setTimeout(() => {
              deleteAllCookies();
              setTimeout(() => {
                clearStorage(app_version);
                setTimeout(() => {
                  unregisterServiceWorker();
                }, 1000);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 5000);
      } else {
        registerServiceWorker();
      }
    } else { // web app in development
      registerServiceWorker();
    }

    return () => {
      // window.removeEventListener('error', () => {});
    }
  }, []);

  const clearAllCaches = () => {
    try {
      // check if there is cache in window and clear it
      if ('caches' in window) {
        caches.keys().then((names) => {
          // Delete all the cache files
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    } catch (err) {

    }
  }

  const deleteAllCookies = () => {
    try {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      for (var j = 0; j < cookies.length; j++) {
        var _cookie = cookies[j];
        var _eqPos = _cookie.indexOf("=");
        var _name = _eqPos > -1 ? _cookie.substring(0, _eqPos) : _cookie;
        document.cookie = _name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "")
          .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
      });
      var _cookies = document.cookie.split("; ");
      for (var c = 0; c < _cookies.length; c++) {
        var d = window.location.hostname.split(".");
        while (d.length > 0) {
          var cookieBase = encodeURIComponent(_cookies[c].split(";")[0].split("=")[0]) +
            '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' +
            d.join('.') +
            ' ;path=';
          var p = window.location.pathname.split('/');
          document.cookie = cookieBase + '/';
          while (p.length > 0) {
            document.cookie = cookieBase + p.join('/');
            p.pop();
          };
          d.shift();
        }
      }
    } catch (err) {

    }
  }

  const clearStorage = (app_version: string) => {
    // clear sessionStorage
    sessionStorage.clear();
    // set localStorage version
    localStorage.setItem('app-version', app_version);
  }

  const unregisterServiceWorker = () => {
    serviceWorkerRegistration.unregister();
  }

  const registerServiceWorker = () => {
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://cra.link/PWA
    serviceWorkerRegistration.register();
  }
  return <></>;
}