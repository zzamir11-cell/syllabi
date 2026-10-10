'use client';

import React from 'react';
import { useSyllabi } from '@/lib/store';
import { Toast } from '@astryxdesign/core/Toast';

export function ToastPresenter() {
  const { toastMessage, showToast } = useSyllabi();

  if (!toastMessage) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 99999,
        maxWidth: 400,
      }}
    >
      <Toast
        body={toastMessage}
        type="info"
        isAutoHide={true}
        autoHideDuration={3500}
        onDismiss={() => showToast('')}
      />
    </div>
  );
}

