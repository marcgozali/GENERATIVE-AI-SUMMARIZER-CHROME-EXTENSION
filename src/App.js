import './App.css';
import {Button, Heading, Loader, Text, withAuthenticator} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsmobile from './aws-exports';
import {Amplify} from "aws-amplify";
import React, {useState} from "react";

// https://aws.amazon.com/blogs/mobile/how-to-build-a-chrome-extension-that-integrates-with-amplify-resources/
Amplify.configure(awsmobile);

async function getSummary(user, articleData) {
    const apiCall = 'REPLACE WITH API GATEWAY URL'
    const cleanedArticleData = articleData.replace(/\\+/g, '').replace(/\n\s+/g, '\n');
    const prompt = `Human:${cleanedArticleData}\n\nAssistant:`
    const fetchSummary = await fetch(apiCall, {
        method: "POST",
        body: prompt
    })
    return await fetchSummary.text()
    // https://docs.amplify.aws/javascript/build-a-backend/restapi/gen-ai/#add-an-api-layer
}

function App({signOut, user}) {

    const [summaryText, setSummaryText] = useState('')
    const [isLoading, setIsLoading] = useState(false);

    function test() {
        setIsLoading(true)
        /* eslint-disable no-undef */
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            const activeTabId = tabs[0].id;
            chrome.scripting.executeScript({
                target: {tabId: activeTabId},
                func: () => {
                    let articleContent = document.querySelector(".ArticlePage-mainContent")
                    if (articleContent) {
                        // remove share text bar from Amazon science website
                        const shareContent = articleContent.querySelector(".ActionBar-heading")
                        if (shareContent) {
                            articleContent.querySelector(".ActionBar-heading").remove()
                        }
                    }
                    return getSummary(user, articleContent.textContent)
                },
            }).then(r => {
                setIsLoading(false);
                setSummaryText(r[0].result)
            })
        })
    }

    return (
        <div className="App">
            <div>
                <Heading level={1}>Hello {user.username}</Heading>
                <Button onClick={signOut}>Sign out</Button>
                <Button onClick={test}>Generate Summary</Button>
            </div>
            <div>
                {isLoading ? <Loader
                        size="small"
                        variation="linear"
                        filledColor="navy"
                    /> :
                    <Text
                        variation="primary"
                        as="p"
                        lineHeight="1.5em"
                        fontWeight={400}
                        fontSize="1em"
                        fontStyle="normal"
                    >
                        {summaryText}
                    </Text>
                }
            </div>
        </div>
    );
}

/**
 * TODO:
 * Add authentication to API
 * Obfuscate API call
 * Make the output look nicer
 */
export default withAuthenticator(App);