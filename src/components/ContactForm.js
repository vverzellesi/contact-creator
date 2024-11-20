import { ConnectionsAccessor, useIntegrationApp } from '@integration-app/react';
import React, { useEffect, useState } from 'react';
import './ContactForm.css';

const ContactForm = () => {
    const integrationApp = useIntegrationApp();

    useEffect(() => { }, [integrationApp]);

    const [contact, setContact] = useState({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        pronouns: '',
    });
    const [contactLinks, setContactLinks] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContact({ ...contact, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const connectionAccessor = new ConnectionsAccessor(integrationApp);
            const allConnections = await connectionAccessor.find();
            const activeConnections = allConnections.items.filter(connection => !connection.disconnected);
            const newContactLinks = [];

            for (const connection of activeConnections) {
                try {
                    const response = await integrationApp
                        .connection(connection.id)
                        .action('create-contact')
                        .run(contact);

                    const contactLink = buildContactLink(response.output?.id, connection.integration.key);

                    newContactLinks.push({
                        name: connection.name,
                        link: contactLink,
                    });

                    console.log(`Contact created on ${connection.name}`, response);
                } catch (error) {
                    console.error(`Error while running action for connectionId ${connection.id}`, error);
                }
            }

            setContactLinks(newContactLinks);
            setContact({
                fullName: '',
                email: '',
                phone: '',
                companyName: '',
                pronouns: '',
            });
        } catch (error) {
            console.error('Error to submit form', error);
        } finally {
            setLoading(false);
        }
    };

    const buildContactLink = (id, crm) => {
        const crmLinkTemplates = {
            hubspot: `https://app.hubspot.com/contacts/${process.env.REACT_APP_HUBSPOT_COMPANY_ID}/record/0-1/${id}`,
            pipedrive: `https://${process.env.REACT_APP_PIPEDRIVE_COMPANY_ID}.pipedrive.com/person/${id}`,
        }
        return crmLinkTemplates[crm] || null;
    }

    return (
        <>
            <h2 className="contact-form-title">Create New Contact</h2>
            <div className="contact-form-container">
                <form onSubmit={handleSubmit}>
                    <div className="contact-form-group">
                        <label htmlFor="fullName" className="contact-form-label">Full Name</label>
                        <input id="fullName" name="fullName" required className="contact-form-input" placeholder="Full Name" value={contact.fullName} onChange={handleChange} />
                    </div>
                    <div className="contact-form-group">
                        <label htmlFor="email" className="contact-form-label">Email</label>
                        <input id="email" name="email" type="email" required className="contact-form-input" placeholder="Email" value={contact.email} onChange={handleChange} />
                    </div>
                    <div className="contact-form-group">
                        <label htmlFor="phone" className="contact-form-label">Phone</label>
                        <input id="phone" name="phone" type="tel" required className="contact-form-input" placeholder="Phone" value={contact.phone} onChange={handleChange} />
                    </div>
                    <div className="contact-form-group">
                        <label htmlFor="companyName" className="contact-form-label">Company Name</label>
                        <input id="companyName" name="companyName" className="contact-form-input" placeholder="Company Name" value={contact.companyName} onChange={handleChange} />
                    </div>
                    <div className="contact-form-group">
                        <label htmlFor="pronouns" className="contact-form-label">Pronouns</label>
                        <select
                            id="pronouns"
                            name="pronouns"
                            className="contact-form-input"
                            value={contact.pronouns}
                            onChange={handleChange}
                        >
                            <option value="" disabled selected>Select Pronouns</option>
                            <option value="he/him">He/Him</option>
                            <option value="she/her">She/Her</option>
                            <option value="they/them">They/Them</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <button type="submit" disabled={loading} className="contact-form-button">
                        {loading ? 'Creating...' : 'Create Contact'}
                    </button>
                    {loading && (
                        <img src="/spinner.svg" />
                    )}
                </form>

                {contactLinks.length > 0 && (
                    <div className="contact-links-container">
                        <h3 className="contact-links-header">Contact Links</h3>
                        <ul className="contact-links-list">
                            {contactLinks.map((contactLink, index) => (
                                <li key={index} className="contact-links-list-item">
                                    <a href={contactLink.link} target="_blank" rel="noopener noreferrer" className="contact-link">
                                        View Contact in {contactLink.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};

export default ContactForm;
