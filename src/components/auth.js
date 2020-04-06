import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import config from '../config';
import { useDispatch } from 'react-redux';
import { addToken } from '../redux/actions';
import ErrorContainer from './errorContainer';

const AuthContainer = styled.main`
    display: grid;
    grid-template-columns: 1fr 2fr max-content 2fr 1fr;
    grid-template-rows: 1fr 3fr 1fr 3fr;
    grid-template-areas:
    " . . title . ."
    " . instructions instructions instructions ."
    ". error error error ."
    ". button button button .";
    > h1{
        grid-area: title;
    }
    > p{
        grid-area: instructions;
        margin: auto;
    }
    > button{
        grid-area: button;
        background-color: var(--color-blue);
        color: var(--color-text);
        border-radius: 2px;
        margin: auto;
        padding: 2rem;
        font-size: 1.5rem;
    }
    > div{
        grid-area: error;
    }
`;

function Auth() {

    const [ error, setError ] = useState(false);
    const dispatch = useDispatch();

    const tokenCallback = useCallback(
        async (auto = false) => {
            let ignore = false;
            const controller = new AbortController();
            console.log(auto);

            async function fetchSearchResults() {
                ignore = false;
                let responseBody = {};
                // setLoading(true);
                try {
                    const response = await fetch(
                        `${config.appURL}/api/login`,
                    { 
                        signal: controller.signal,
                    }
                    );
                    if (auto!==true && response.status === 401){
                        ignore = true;
                        setError(true);
                    } else {
                        responseBody = await response.json();
                    }
                } catch (e) {
                    if (e instanceof DOMException) {
                        console.log("== HTTP request aborted");
                    } else {
                        setError(true);
                        console.log(e);
                    }
                }
                if (!ignore) {
                    setError(false);
                    dispatch(addToken(responseBody.token));
                } else {
                    // console.log("== ignoring results");
                }
            }
            console.log()
            fetchSearchResults();
            return () => {
                controller.abort();
                ignore = true;
            };
        },
        [dispatch],
      );

    


    // async function getToken(auto = false){
    //     let ignore = false;
    //     const controller = new AbortController();
    //     console.log(auto);

    //     async function fetchSearchResults() {
    //         ignore = false;
    //         let responseBody = {};
    //         // setLoading(true);
    //         try {
    //             const response = await fetch(
    //                 `/api/login`,
    //             { 
    //                 signal: controller.signal,
    //             }
    //             );
    //             if (auto!==true && response.status === 401){
    //                 ignore = true;
    //                 setError(true);
    //             } else {
    //                 responseBody = await response.json();
    //             }
    //         } catch (e) {
    //             if (e instanceof DOMException) {
    //                 console.log("== HTTP request aborted");
    //             } else {
    //                 setError(true);
    //                 console.log(e);
    //             }
    //         }
    //         if (!ignore) {
    //             setError(false);
    //             dispatch(addToken(responseBody.token));
    //         } else {
    //             // console.log("== ignoring results");
    //         }
    //     }
    //     console.log()
    //     fetchSearchResults();
    //     return () => {
    //         controller.abort();
    //         ignore = true;
    //     };
    // }

    useEffect(() => {
        tokenCallback(true);
    }, [tokenCallback]);

    return (
        <AuthContainer>
            <h1>Log in</h1>
            <p>Enter {config.prefix}login in Discord then click "I've logged in"</p>
            {error && <ErrorContainer>Invalid login</ErrorContainer>}
            <button onClick={tokenCallback}>I've logged in</button>
        </AuthContainer>
    );
}

export default Auth;