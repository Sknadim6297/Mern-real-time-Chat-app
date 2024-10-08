import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from "react-icons/fa";
import { IoClose, IoSend } from "react-icons/io5";
import { BsCheck2All, BsCheck2 } from 'react-icons/bs'; // Import tick icons
import backgroundImage from '../assets/wallapaper.jpeg';
import moment from 'moment';
import uploadFile from '../helpers/uploadFiles';
import Loading from './Loading';
import Avatar from './Avatar';

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector(state => state.user.socketConnection);
  const user = useSelector(state => state.user);

  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const currentMessage = useRef(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessage]);

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);

      socketConnection.on('message-user', setDataUser);
      socketConnection.on('message', setAllMessage);
      socketConnection.on('messages-read', handleMessagesRead);

      return () => {
        socketConnection.off('message-user');
        socketConnection.off('message');
        socketConnection.off('messages-read');
      };
    }
  }, [socketConnection, params.userId]);

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(prev => !prev);
  };

  const handleUpload = async (file, type) => {
    setLoading(true);
    const uploadResponse = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);

    setMessage(prev => ({
      ...prev,
      [`${type}Url`]: uploadResponse.url
    }));
  };

  const handleClearUpload = (type) => {
    setMessage(prev => ({
      ...prev,
      [`${type}Url`]: ""
    }));
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setMessage(prev => ({
      ...prev,
      text: value
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit('new message', {
          sender: user._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user._id
        });
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: ""
        });
      }
    }
  };

  const handleMessagesRead = (userId) => {
    setAllMessage(prevMessages =>
      prevMessages.map(msg =>
        msg.msgByUserId === userId ? { ...msg, seen: true } : msg
      )
    );
  };

  return (
    <div
      style={{ backgroundImage: `url(${backgroundImage})` }}
      className='bg-no-repeat bg-cover dark:bg-gray-900 dark:text-white h-[calc(100vh-3.5rem)] flex flex-col'>

      <header className='sticky top-0 h-14 bg-white dark:bg-gray-800 flex justify-between items-center px-4 border-b border-zinc-900'>
        <div className='flex items-center gap-4'>
          <Link to="/" className='lg:hidden'>
            <FaAngleLeft size={25} />
          </Link>
          <Avatar
            className='overflow-hidden rounded-full'
            imageUrl={dataUser.profile_pic}
            name={dataUser.name}
            userId={dataUser._id}
          />
          <div>
            <h3 className='font-semibold text-lg text-ellipsis line-clamp-1'>{dataUser.name}</h3>
            <p className='-my-2 text-sm'>
              {dataUser.online ? <span className='text-primary'>online</span> : <span className='text-slate-400'>offline</span>}
            </p>
          </div>
        </div>

        <button className='cursor-pointer hover:text-primary'>
          <HiDotsVertical size={20} />
        </button>
      </header>

      <main className='flex-1 overflow-hidden'>
        <section className='h-[calc(100vh-120px)] overflow-y-auto scrollbar bg-slate-200 bg-opacity-50 dark:bg-gray-800'>
          <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
            {allMessage.map((msg, index) => (
              <div
                className={`p-1 py-1 rounded w-fit max-w-[80%] md:max-w-sm lg:max-w-md ${user._id === msg.msgByUserId ? "ml-auto bg-teal-100 dark:bg-teal-700" : "bg-white dark:bg-gray-700"}`}
                key={index}
              >
                <div className='w-full relative'>
                  {msg.imageUrl && <img src={msg.imageUrl} className='w-full h-full object-scale-down' alt="Message" />}
                  {msg.videoUrl && <video src={msg.videoUrl} className='w-full h-full object-scale-down' controls />}
                </div>
                <p className='px-2'>{msg.text}</p>
                <p className='text-xs ml-auto w-fit'>{moment(msg.createdAt).format('hh:mm')}</p>
                {user._id === msg.msgByUserId && (
                  <div className='flex justify-end gap-1'>
                    {msg.seen ? (
                      <BsCheck2All size={15} className='text-blue-500' /> 
                    ) : (
                      <BsCheck2 size={16} className='text-slate-400' />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {message.imageUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={() => handleClearUpload('image')}>
                <IoClose size={30} />
              </div>
              <div className='bg-white p-3 dark:bg-gray-800'>
                <img src={message.imageUrl} alt='uploadImage' className='w-full h-full max-w-sm m-2 object-scale-down' />
              </div>
            </div>
          )}

          {message.videoUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={() => handleClearUpload('video')}>
                <IoClose size={30} />
              </div>
              <div className='bg-white p-3 dark:bg-gray-800'>
                <video src={message.videoUrl} className='w-full h-full max-w-sm m-2 object-scale-down' controls muted autoPlay />
              </div>
            </div>
          )}

          {loading && (
            <div className='w-full h-full flex sticky bottom-0 justify-center items-center'>
              <Loading />
            </div>
          )}
        </section>
      </main>

      <section className='min-h-[4rem] bg-white dark:bg-gray-800 flex items-center border-t border-zinc-900'>
        <div className='relative'>
          <button onClick={handleUploadImageVideoOpen} className='flex justify-center items-center w-12 h-11 rounded-full hover:bg-red-400 hover:text-white'>
            <FaPlus size={18} />
          </button>

          {openImageVideoUpload && (
            <div className='bg-white shadow-md dark:bg-gray-800 rounded overflow-hidden absolute bottom-12 w-[10rem]'>
              <form>
                <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer dark:hover:bg-gray-700'>
                  <FaImage size={18} />
                  <span>Image</span>
                </label>
                <label htmlFor='uploadVideo' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer dark:hover:bg-gray-700'>
                  <FaVideo size={18} />
                  <span>Video</span>
                </label>
                <input
                  type='file'
                  id='uploadImage'
                  onChange={(e) => handleUpload(e.target.files[0], 'image')}
                  style={{ display: 'none' }}
                />
                <input
                  type='file'
                  id='uploadVideo'
                  onChange={(e) => handleUpload(e.target.files[0], 'video')}
                  style={{ display: 'none' }}
                />
              </form>
            </div>
          )}
        </div>

        <form className='w-full flex items-center mx-2'>
          <textarea
            name='text'
            value={message.text}
            onChange={handleOnChange}
            rows='1'
            placeholder='Type a message...'
            className='resize-none overflow-hidden flex-1 p-2 border rounded border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800'
          />
          <button
            type='submit'
            onClick={handleSendMessage}
            className='ml-2 bg-primary text-white p-2 rounded-full hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
          >
            <IoSend size={25} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;
