/* eslint-disable no-unused-vars */
import { createContext, useContext, useState } from "react";
import { adminServiceFactory } from "../Services/adminService";
import { useNavigate } from "react-router-dom";
import { Loader } from "../Loader/Loader";
import { notify } from '../../utils/notify';

export const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const adminService = adminServiceFactory()
    const navigate = useNavigate();
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
            setPendingAds(response);
            setIsLoading(false);
            return response;
        } catch (e) {
            showErrorAndSetTimeouts(e.message);
            setIsLoading(false);
            throw e;
        }
    };
    const fetchApprovedAds = async () => {
        try {
            setIsLoading(true);
            const response = await adminService.approvedAds();
            setApprovedAds(response);
            setIsLoading(false);
            return response;
        } catch (e) {
            showErrorAndSetTimeouts(e.message);
            setIsLoading(false);
            throw e;
        }
    };
    const fetchRejectAds = async () => {
        try {
            setIsLoading(true);
            const response = await adminService.rejectAds();
            setRejectAds(response);
            setIsLoading(false);
            return response;
        } catch (e) {
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
                notify('success-approved');
            } else if (newStatus === 'denied') {
                await fetchPendingAds();

                notify('success-reject');
            }
        } catch (e) {
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
            notify('error')
            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };
    const contextService = {
        fetchPendingAds,
        pendingAds,
        updateAdStatus,
        deleteAd,
        fetchApprovedAds,
        approvedAds,
        fetchRejectAds
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