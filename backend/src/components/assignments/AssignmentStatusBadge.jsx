import React from 'react';
import { Chip } from '@mui/material';
import { CheckCircle, Schedule, Warning, Grading } from '@mui/icons-material';
import { isOverdue } from '../../utils/helpers';

export default function AssignmentStatusBadge({ status, dueDate }) {
  if (status === 'graded')    return <Chip label="Graded"    color="success" size="small" icon={<CheckCircle sx={{ fontSize: '13px !important' }} />} />;
  if (status === 'submitted') return <Chip label="Submitted" color="info"    size="small" icon={<Grading     sx={{ fontSize: '13px !important' }} />} />;
  if (isOverdue(dueDate))     return <Chip label="Overdue"   color="error"   size="small" icon={<Warning     sx={{ fontSize: '13px !important' }} />} />;
  return                             <Chip label="Pending"   color="warning" size="small" icon={<Schedule    sx={{ fontSize: '13px !important' }} />} />;
}
