const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://Web-Admin:9HPkAFXKZGyZTzvD@nallamala-website.yivwpw2.mongodb.net/nallamala_db";

// Schemas & Models
const fileSchema = new mongoose.Schema({
    data: Buffer,
    contentType: String,
    filename: String
}, { timestamps: true });

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'video', 'link'], required: true },
    url: String,
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    description: String,
    section: { type: String, enum: ['notes', 'pyqs', 'documents'], default: 'documents', required: true },
    
    // Notes fields
    stream: { type: String, enum: ['Data Science', 'Electronics'] },
    level: { type: String, enum: ['Foundation', 'Diploma', 'Degree'] },
    subject: String,
    resourceType: { type: String, enum: ['notes', 'books'] },
    
    // PYQs fields
    streamLevel: String,
    year: String,
    term: String,
    examType: String,
    path: String
}, { timestamps: true });

const FileModel = mongoose.models.File || mongoose.model('File', fileSchema);
const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);

// Static data from frontend resources page
const officialDocuments = {
  academic: [
    { name: "2026 Grading Document", url: "https://docs.google.com/document/u/1/d/e/2PACX-1vSUvKzH7yIXNVwUgRYSIT8M0x1jhFSkslEtj9UPo3dtWI_sJ38Hh_PzbBygpF0vIOo8K7lTy-uYkqdu/pub?urp=gmail_link", description: "Official grading policy and criteria" },
    { name: "Score Checker", url: "https://score-checker-379619009600.asia-south1.run.app/course_wise", description: "Check your course scores online" },
    { name: "Course Syllabus", url: "https://docs.google.com/document/u/1/d/e/2PACX-1vSWW4TMd2ujKYOeSay5iCIyTGLtJgM1KWC-Ernu_JdhugLtB0dXV9i966Z-ZaPZ9qAAI1_QtWa3o3br/pub#h.64f8davxbp1d", description: "Complete course syllabus details" },
    { name: "Course Playlist", url: "https://discourse.onlinedegree.iitm.ac.in/t/course-yt-channel-list-data-science-and-applications/115619", description: "YouTube course video playlists" },
  ],
  policies: [
    { name: "Academic Malpractice Policy", url: "https://docs.google.com/document/d/e/2PACX-1vTt6ndMAI1-Y7Okm3HXmv0OFhFliUJPzkrUkQuX4InovMYewy_CWmFzmE4mUOAl_TjWlSrZNYWUOnG7/pub", description: "Academic integrity guidelines" },
    { name: "Non-Academic Malpractice Policy", url: "https://docs.google.com/document/d/e/2PACX-1vS3kG688sVzBil9uEFa9mXrnpuMAqE0LU1FpH1-TMDCHZF0XjC1265GmhVePdYvrc0_5qyq8OXwIZUb/pub", description: "Code of conduct and discipline" },
  ],
  programs: [
    { name: "Foundation Announcement", url: "https://docs.google.com/document/u/1/d/e/2PACX-1vT3tXeBI5EnNRbfuJL595x44HL47l-UIVFhQ8A0u5pWZWwuQZf6AovUgpbfOL4FEdgoxB86R83E_b3g/pub#h.srdh0vy92h9g", description: "Foundation level program details" },
    { name: "Diploma Announcement", url: "https://docs.google.com/document/u/1/d/e/2PACX-1vS5AqaruazbgknMp9pPDXO1YVDFliSpsF0oZdEPp_vMGaX9pPTm_Jpid2OvecYr6AovUgpbfOL4FEdgoxB86R83E_b3g/pub#h.l8xwua84njlp", description: "Diploma level program details" },
    { name: "Degree Announcement", url: "https://docs.google.com/document/u/1/d/e/2PACX-1vQh79CJlzQiP0KXhVR6Rp1vwMOJA-OXY1hrOjvWk6ypBDYFVbsZOzycc4OHMA7xEK5ezjDEDD0B44QD/pub#h.krgvmoow3xb", description: "Degree level program details" },
    { name: "M.Tech Pathway", url: "https://docs.google.com/document/u/1/d/e/2PACX-1vRrtiiHlurfHtFnJnDwtNZ0NHAci8PQ7pHsiX3V3SZKmbSmALDk4whCO5La6efs4MSmBLVTH2ZfGJNL/pub", description: "Master's program pathway options" },
  ],
  transfers: [
    { name: "NPTEL Credit Transfer", url: "https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vSJXV0JECyoQvgWvBlVxO13G0KRm5a1qNCRBa7rAw8GDY4e0cfm1KiVCwIgs_ed80ObtzQ1rfx_JWIR/pubhtml?gid=399341609&single=true", description: "Free elective credit transfer" },
    { name: "HS NPTEL Transfer", url: "https://docs.google.com/document/u/1/d/e/2PACX-1vRrtiiHlurfHtFnJnDwtNZ0NHAci8PQ7pHsiX3V3SZKmbSmALDk4whCO5La6efs4MSmBLVTH2ZfGJNL/pub", description: "Humanities credit transfer" },
    { name: "SCT Information", url: "https://docs.google.com/document/d/e/2PACX-1vS4Hhh4MsKD2WL8_D26Vw2WJKw0CBtPihZyKrnEM_kefRXm_O75GqTcJA6lR0X_xCiVL5gUi5y6_bjw/pub", description: "Special credit transfer details" },
    { name: "SCT Form", url: "https://docs.google.com/forms/d/e/1FAIpQLSfgPEfiNK0bTqXj8F5g2nRFJaugfm7Q6Ykkf6lNy0UsnvO7Jw/closedform", description: "Apply for credit transfer" },
  ],
  opportunities: [
    { name: "Course Mentorship", url: "https://docs.google.com/document/d/1-KokspC_tpcZUkr_A_qepK6bp9j-1pQTskI9WmAhc6I/edit?tab=t.0#heading=h.8maoib1anf", description: "Become a course mentor" },
    { name: "TAship Information", url: "https://docs.google.com/document/d/1T7BJwyFs6otHAWiSXFQ8SvhpYRlm9PPOGZmtKvj_C4U/edit?tab=t.0#heading=h.cxy8jmc2wo04", description: "Teaching assistant positions" },
  ],
  resources: [
    { name: "Document Archive", url: "https://study.iitm.ac.in/ds/archive.html", description: "All official documents archive" },
    { name: "Official Git Organization", url: "https://github.com/bsc-iitm", description: "GitHub organization repository" },
    { name: "Official WhatsApp", url: "https://api.whatsapp.com/message/IVROM2UN7XIJL1?autoload=1&app_absent=0", description: "Connect via WhatsApp" },
    { name: "Document Application Process", url: "https://docs.google.com/document/u/1/d/e/2PACX-1vQnn2cFan5BqTTAByCoqtue-0XSmFXQPT91bADDL_i33tHMh8C0ZJepvFBwze4E5zJbGiBMdQa59VeT/pub", description: "How to apply for documents" },
  ],
};

const studyMaterials = [
  { name: "Python Notes", stream: "Data Science", level: "Foundation", subject: "Python", type: "notes", url: "#" },
  { name: "Statistics Notes", stream: "Data Science", level: "Foundation", subject: "Statistics", type: "notes", url: "#" },
  { name: "Maths Notes", stream: "Data Science", level: "Foundation", subject: "Mathematics", type: "notes", url: "#" },
  { name: "CT Notes", stream: "Data Science", level: "Foundation", subject: "Computational Thinking", type: "notes", url: "#" },
  { name: "English 1 Notes", stream: "Data Science", level: "Foundation", subject: "English 1", type: "notes", url: "#" },
  { name: "English 2 Notes", stream: "Data Science", level: "Foundation", subject: "English 2", type: "notes", url: "#" },

  { name: "Java Notes", stream: "Data Science", level: "Diploma", subject: "Java", type: "notes", url: "#" },
  { name: "DBMS Notes", stream: "Data Science", level: "Diploma", subject: "DBMS", type: "notes", url: "#" },
  { name: "AppDev 1 Notes", stream: "Data Science", level: "Diploma", subject: "AppDev 1", type: "notes", url: "#" },
  { name: "AppDev 2 Notes", stream: "Data Science", level: "Diploma", subject: "AppDev 2", type: "notes", url: "#" },
  { name: "PDSA Notes", stream: "Data Science", level: "Diploma", subject: "PDSA", type: "notes", url: "#" },
  { name: "Maths 2 Notes", stream: "Data Science", level: "Diploma", subject: "Mathematics 2", type: "notes", url: "#" },
  { name: "Stats 2 Notes", stream: "Data Science", level: "Diploma", subject: "Statistics 2", type: "notes", url: "#" },

  { name: "Machine Learning Notes", stream: "Data Science", level: "Degree", subject: "Machine Learning", type: "notes", url: "#" },
  { name: "Business Data Management Notes", stream: "Data Science", level: "Degree", subject: "BDM", type: "notes", url: "#" },
  { name: "Business Analytics Notes", stream: "Data Science", level: "Degree", subject: "BA", type: "notes", url: "#" },
  { name: "Tools in Data Science Notes", stream: "Data Science", level: "Degree", subject: "TDS", type: "notes", url: "#" },
  { name: "System Commands Notes", stream: "Data Science", level: "Degree", subject: "System Commands", type: "notes", url: "#" },

  { name: "Python Notes", stream: "Electronics", level: "Foundation", subject: "Python", type: "notes", url: "#" },
  { name: "Statistics Notes", stream: "Electronics", level: "Foundation", subject: "Statistics", type: "notes", url: "#" },
  { name: "Maths Notes", stream: "Electronics", level: "Foundation", subject: "Mathematics", type: "notes", url: "#" },
  { name: "CT Notes", stream: "Electronics", level: "Foundation", subject: "Computational Thinking", type: "notes", url: "#" },

  { name: "Digital Circuits Notes", stream: "Electronics", level: "Diploma", subject: "Digital Circuits", type: "notes", url: "#" },
  { name: "Analog Circuits Notes", stream: "Electronics", level: "Diploma", subject: "Analog Circuits", type: "notes", url: "#" },

  { name: "Python Programming Book", stream: "Data Science", level: "Foundation", subject: "Python", type: "books", url: "#" },
  { name: "Data Structures Book", stream: "Data Science", level: "Diploma", subject: "PDSA", type: "books", url: "#" },
];

function getFilesRecursively(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.startsWith('.')) continue;
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            results = results.concat(getFilesRecursively(fullPath));
        } else {
            results.push(fullPath);
        }
    }
    return results;
}

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB database.");

        // Clear existing files and resources to prevent double-seeding
        console.log("Wiping existing Resources and Files from database...");
        await Resource.deleteMany({});
        await FileModel.deleteMany({});
        console.log("Database collections cleared successfully.");

        // 1. Seed Official Documents
        console.log("Seeding Official Documents...");
        for (const [subCategory, docs] of Object.entries(officialDocuments)) {
            for (const doc of docs) {
                await Resource.create({
                    title: doc.name,
                    type: 'link',
                    url: doc.url,
                    description: doc.description,
                    section: 'documents',
                    subCategory: subCategory
                });
            }
        }
        console.log("Official Documents seeded successfully.");

        // 2. Seed Notes & Study Materials
        console.log("Seeding Notes & Study Materials...");
        for (const mat of studyMaterials) {
            await Resource.create({
                title: mat.name,
                type: 'link',
                url: mat.url,
                section: 'notes',
                stream: mat.stream,
                level: mat.level,
                subject: mat.subject,
                resourceType: mat.type
            });
        }
        console.log("Notes & Study Materials seeded successfully.");

        // 3. Seed dynamic PYQ Files from public folder
        const frontendPublicDir = path.join(__dirname, '..', 'updated-nallamala', 'public');
        const levels = ['Foundation', 'Diploma'];
        console.log("Scanning frontend public/Foundation and public/Diploma folders for PYQ files...");

        let uploadedFileCount = 0;

        for (const level of levels) {
            const levelPath = path.join(frontendPublicDir, level);
            if (fs.existsSync(levelPath)) {
                const files = getFilesRecursively(levelPath);
                for (const filePath of files) {
                    const relativePath = path.relative(frontendPublicDir, filePath).replace(/\\/g, '/'); // e.g. Foundation/Python/OPPEs/questions.md
                    const filename = path.basename(filePath);
                    const fileContent = fs.readFileSync(filePath);

                    // Exclude duplicate/copy files to save database space
                    if (filename.includes('(1)') || filename.includes('(2)') || filename.includes('(3)') || filename.includes('copy')) {
                        console.warn(`Skipping duplicate file to conserve database space: ${relativePath}`);
                        continue;
                    }

                    // Safety Size Check: Limit files to 1.8MB to fit in the 512MB free tier and avoid blocking cluster writes
                    if (fileContent.length > 1.8 * 1024 * 1024) {
                        console.warn(`Skipping large file (>1.8MB) to conserve database space: ${relativePath} (${(fileContent.length/(1024*1024)).toFixed(2)}MB)`);
                        continue;
                    }
                    
                    // Deduce Content Type
                    let contentType = 'application/octet-stream';
                    if (filename.endsWith('.pdf')) contentType = 'application/pdf';
                    else if (filename.endsWith('.md')) contentType = 'text/markdown';
                    else if (filename.endsWith('.txt')) contentType = 'text/plain';
                    else if (filename.endsWith('.png')) contentType = 'image/png';
                    else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = 'image/jpeg';

                    try {
                        // Save the binary file to Files Collection
                        const savedFile = await FileModel.create({
                            data: fileContent,
                            contentType: contentType,
                            filename: filename
                        });

                        // Save resource link
                        await Resource.create({
                            title: filename,
                            type: 'pdf', // default PDF type
                            fileId: savedFile._id,
                            section: 'pyqs',
                            path: relativePath,
                            streamLevel: `Data Science - ${level}`,
                            year: 'All Years',
                            term: 'All Terms',
                            examType: 'All Exams'
                        });
                        
                        uploadedFileCount++;
                        console.log(`Uploaded and seeded file: ${relativePath}`);
                    } catch (fileErr) {
                        console.error(`Failed to upload/seed file: ${relativePath} (${(fileContent.length/(1024*1024)).toFixed(2)}MB). Error:`, fileErr.message || fileErr);
                    }
                }
            }
        }
        console.log(`Successfully uploaded and seeded ${uploadedFileCount} PYQ filesystem documents into MongoDB.`);

        await mongoose.disconnect();
        console.log("Database seeder completed successfully!");
    } catch (err) {
        console.error("Seeder failed:", err);
    }
}

run();
