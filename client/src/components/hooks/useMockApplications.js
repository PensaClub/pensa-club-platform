import { useState } from 'react';
import mockApplicationsData from '../Initiatives/data/mockApplications.json';
// import { initiativeServiceFactory } from '../Services/initiativeService';
// import { useAuthContext } from '../contexts/UserContext';

export const useMockApplications = () => {
  const [applications, setApplications] = useState(mockApplicationsData.applications);
  // const { token } = useAuthContext();
  // const initiativeService = initiativeServiceFactory(token);

  // Получава всички кандидатури
  const getAllApplications = async () => {
    try {
      // Реални API заявки (закоментирани за сега)
      // const response = await initiativeService.getAllApplications();
      // setApplications(response.applications || response);
      // return response.applications || response;

      // Mock данни (текущо)
      return applications;
    } catch (error) {
      console.error('Error getting all applications:', error);
      return [];
    }
  };

  // Получава кандидатури за конкретен проект
  const getApplicationsByProject = async (projectId) => {
    try {
      // Реални API заявки (закоментирани за сега)
      // const response = await initiativeService.getProjectApplications(projectId);
      // return response.applications || response;

      // Mock данни (текущо)
      return applications.filter(app => app.projectId === projectId);
    } catch (error) {
      console.error('Error getting project applications:', error);
      return [];
    }
  };

  // Добавя нова кандидатура
  const addApplication = async (newApplication) => {
    try {
      // Реални API заявки (закоментирани за сега)
      // const response = await initiativeService.applyToProject(
      //   newApplication.projectId, 
      //   newApplication
      // );
      // const savedApplication = response.application || response;
      // setApplications(prev => [savedApplication, ...prev]);
      // return savedApplication;

      // Mock данни (текущо)
      const applicationWithId = {
        ...newApplication,
        id: `app-${Date.now()}`,
        appliedAt: new Date().toISOString()
      };
      
      setApplications(prev => [applicationWithId, ...prev]);
      return applicationWithId;
    } catch (error) {
      console.error('Error adding application:', error);
      throw error;
    }
  };

  // Обновява статуса на кандидатура (за админи)
  const updateApplicationStatus = async (applicationId, status) => {
    try {
      // Реални API заявки (закоментирани за сега)
      // const response = await initiativeService.updateApplicationStatus(applicationId, status);
      // const updatedApplication = response.application || response;
      // setApplications(prev => 
      //   prev.map(app => 
      //     app.id === applicationId 
      //       ? { ...app, status: updatedApplication.status } 
      //       : app
      //   )
      // );
      // return updatedApplication;

      // Mock данни (текущо)
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status } 
            : app
        )
      );
      return { id: applicationId, status };
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  };

  // Изтрива кандидатура
  const deleteApplication = async (applicationId) => {
    try {
      // Реални API заявки (закоментирани за сега)
      // await initiativeService.deleteApplication(applicationId);
      // setApplications(prev => prev.filter(app => app.id !== applicationId));

      // Mock данни (текущо)
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      return true;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  };

  // Получава кандидатура по ID
  const getApplicationById = async (applicationId) => {
    try {
      // Реални API заявки (закоментирани за сега)
      // const response = await initiativeService.getApplicationById(applicationId);
      // return response.application || response;

      // Mock данни (текущо)
      return applications.find(app => app.id === applicationId) || null;
    } catch (error) {
      console.error('Error getting application by ID:', error);
      return null;
    }
  };

  return {
    applications,
    getAllApplications,
    getApplicationsByProject,
    addApplication,
    updateApplicationStatus,
    deleteApplication,
    getApplicationById
  };
};