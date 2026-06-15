import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useAppStore } from '@/store/appStore';
import './app.scss';

function App(props) {
  const initFromStorage = useAppStore(s => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
    console.log('[App] store initialized');
  }, [initFromStorage]);

  useDidShow(() => {});
  useDidHide(() => {});

  return props.children;
}

export default App;
