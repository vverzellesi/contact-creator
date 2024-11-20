import { IntegrationAppProvider, useIntegrationApp } from '@integration-app/react';
import ContactForm from './ContactForm';
import './Integration.css';

function Integration() {
    return (
        <IntegrationAppProvider token={process.env.REACT_APP_INTEGRATION_APP_TOKEN}>
            <IntegrationComponent />
            <ContactForm />
        </IntegrationAppProvider>
    );
}

function IntegrationComponent() {
    const integrationApp = useIntegrationApp();

    return (
        <div>
            <button className="integrate-button" onClick={() => integrationApp.open()}>Connect CRM</button>
        </div>
    )
}

export default Integration;