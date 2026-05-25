import React from 'react';
import { Chip } from '@mui/material';
import { CheckCircle, Edit, Archive } from '@mui/icons-material';

const CONFIG = {
  published: { label: 'Published', color: 'success', icon: <CheckCircle sx={{ fontSize: '13px !important' }} /> },
  draft:     { label: 'Draft',     color: 'default', icon: <Edit       sx={{ fontSize: '13px !important' }} /> },
  archived:  { label: 'Archived',  color: 'warning', icon: <Archive    sx={{ fontSize: '13px !important' }} /> },
};

export default function CourseStatusChip({ status = 'draft' }) {
  const cfg = CONFIG[status] || CONFIG.draft;
  return <Chip label={cfg.label} color={cfg.color} size="small" icon={cfg.icon} />;
}
