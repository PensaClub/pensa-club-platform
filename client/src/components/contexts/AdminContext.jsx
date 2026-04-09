/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useCallback } from "react";
import { adminServiceFactory } from "../Services/adminService";
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { Loader } from "../Loader/Loader";
import { notify } from '../../utils/notify.jsx';
import { toast } from 'react-toastify';

export const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const adminService = adminServiceFactory()
    const navigate = useLocalizedNavigate();
    const [pendingAds, setPendingAds] = useState([])
    const [approvedAds, setApprovedAds] = useState([])
    const [rejectAds,setRejectAds] = useState([])
    
    const showErrorAndSetTimeouts = (error) => {
        setErrorMessage(error);
        setIsLoading(false);
        setTimeout(() => {
            setErrorMessage('');
            setIsLoading(false);
        }, 3000);
    };

    const fetchPendingAds = async () => {
        try {
            setIsLoading(true);
            const response = await adminService.pendingAds();
            setPendingAds(response.ads  );
            setIsLoading(false);
            return response.ads;
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
            setIsLoading(false);
            throw e;
        }
    };
    const fetchApprovedAds = async () => {
        try {
            setIsLoading(true);
            const response = await adminService.approvedAds();
            setApprovedAds(response.ads);
            setIsLoading(false);
            return response.ads;
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
            setIsLoading(false);
            throw e;
        }
    };
    const fetchRejectAds = async () => {
        try {
            setIsLoading(true);
            const response = await adminService.rejectAds();
            setRejectAds(response.ads);
            setIsLoading(false);
            return response.ads;
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
            setIsLoading(false);
            throw e;
        }
    };
    const updateAdStatus = async (adId, newStatus, adminComment) => {
        try {
            setIsLoading(true);
            await adminService.updateAdStatus(adId, newStatus, adminComment);
            setIsLoading(false);

            if (newStatus === 'approved') {
                fetchApprovedAds()
                notify('ad-approved');
            } else if (newStatus === 'denied') {
                await fetchPendingAds();

                notify('ad-reject');
            }
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
            setIsLoading(false);
            throw e;
        }
    };

    const deleteAd = async (id) => {
        try {
            setIsLoading(true);
            const response = await adminService.deleteAd(id);
            setIsLoading(false);
            notify('success-delete-ads')
            return response;
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };
    const deleteUserData = async (email) => {
        console.log("email", email);
        try {
            setIsLoading(true);
            const response = await adminService.deleteUserData(email);
            setIsLoading(false);
            notify('success-delete-user');
            return response;
        } catch (e) {
            notify('error', e);
            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };
    const deleteMessage = async (email,id) => {
        try {
            setIsLoading(true);
            const response = await adminService.deleteMessage(email,id);
            setIsLoading(false);
            notify('success-delete-message');
            return response;
        } catch (e) {
            notify('error', e);
            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    // ─── User Management (Admin User Management feature) ───

    const lookupUserByEmail = useCallback(async (email) => {
        try {
            const result = await adminService.lookupUserByEmail(email);
            return result;
        } catch (err) {
            const msg = err?.message || 'Грешка при търсене на потребител';
            toast.error(msg);
            throw err;
        }
    }, []);

    const inviteUser = useCallback(async (data) => {
        try {
            const result = await adminService.inviteUser(data);
            if (result?.emailSent) {
                toast.success('Поканата е изпратена успешно');
            } else {
                toast.warning('Потребителят е създаден, но имейлът не се изпрати');
            }
            return result;
        } catch (err) {
            const msg = err?.message || 'Грешка при изпращане на покана';
            toast.error(msg);
            throw err;
        }
    }, []);

    const sendResetLink = useCallback(async (data) => {
        try {
            const result = await adminService.sendResetLink(data);
            if (result?.smsSent && result?.emailSent) {
                toast.success('Reset линкът + SMS код са изпратени');
            } else if (result?.emailSent) {
                toast.success('Reset линкът е изпратен');
            } else {
                toast.warning('Имаше проблем с изпращането');
            }
            return result;
        } catch (err) {
            const msg = err?.message || 'Грешка при изпращане на reset линк';
            toast.error(msg);
            throw err;
        }
    }, []);

    // ─── Audit log ───

    const getUserActionLogs = useCallback(async (params = {}) => {
        try {
            return await adminService.getUserActionLogs(params);
        } catch (err) {
            toast.error(err?.message || 'Грешка при зареждане на лога');
            throw err;
        }
    }, []);

    const getUserActionLogsExportUrl = useCallback((params = {}) => {
        // Returns URL string (not async) — used for native browser download
        return adminService.exportUserActionLogs(params);
    }, []);

    const contextService = {
        fetchPendingAds,
        pendingAds,
        updateAdStatus,
        deleteAd,
        fetchApprovedAds,
        approvedAds,
        fetchRejectAds,
        rejectAds,
        deleteUserData,
        deleteMessage,

        // User Management
        lookupUserByEmail,
        inviteUser,
        sendResetLink,

        // Audit log
        getUserActionLogs,
        getUserActionLogsExportUrl,
    }

    return (
        <AdminContext.Provider value={contextService}>
            {children}
            {isLoading && <Loader />}

        </AdminContext.Provider>
    )
}
export const useAdminContext = () => {
    const context = useContext(AdminContext);
    return context;
};