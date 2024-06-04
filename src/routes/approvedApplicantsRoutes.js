const express = require('express');
const router = express.Router();
const { getApplicationsWithPublicId, getApprovedApplicants } = require('../models/ApprovedApplicant');

router.get('/approvedApplicants', async (req, res) => {
    try {
        const applications = await getApplicationsWithPublicId();
        const approvedApplicants = await getApprovedApplicants();
    
        console.log('Applications:', applications);
        console.log('Approved Applicants:', approvedApplicants);
    
        // Crear un conjunto de IDs de usuarios aprobados
        const approvedUserIds = new Set(approvedApplicants.map(applicant => applicant.user_id));
    
        console.log('Approved User IDs:', [...approvedUserIds]);
    
        // Clasificar las aplicaciones
        const passed = applications.filter(application => approvedUserIds.has(application.user_id)).length;
        const notPassed = applications.length - passed;
    
        res.status(200).json({ passed, notPassed });
      } catch (error) {
        console.error('Error comparing data:', error);
        res.status(500).json({ error: 'Error comparing data' });
      }
    });
    

module.exports = router;
