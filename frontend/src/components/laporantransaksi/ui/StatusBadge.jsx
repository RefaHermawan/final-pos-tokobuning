import React from "react";
import { Download, Filter as FilterIcon, RotateCcw, FileText, DollarSign, Hash, CheckCircle, Clock, XCircle, Calendar, Eye, Inbox, User } from 'lucide-react';

const StatusBadge = ({ status }) => {
    let style = "bg-light-gray/50 text-text-secondary";
    let Icon = Clock;

    switch (status?.toUpperCase()) {
        case 'LUNAS':
            style = "bg-success/10 text-success";
            Icon = CheckCircle;
            break;
        case 'PENDING':
            style = "bg-yellow-500/10 text-yellow-500";
            Icon = Clock;
            break;
        case 'BATAL':
            style = "bg-error/10 text-error";
            Icon = XCircle;
            break;
        default:
            break;
    }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style}`}>
            <Icon size={14} />
            {status}
        </span>
    );
};

export default StatusBadge;