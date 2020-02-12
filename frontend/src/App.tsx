import React, { useState, useCallback, ChangeEvent, useMemo } from 'react';

const API_ENDPOINT = process.env.REACT_APP_API_HTTPS_URL;

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //ccredentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    // credirect: 'follow', // manual, *follow, error
    // referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return await response.json(); // parses JSON response into native JavaScript objects
}


interface Field {
  value: string;
  errorMessage?: string;
}

const INITIAL_STATE = {
  email: {
    value: "",
  },
  name: {
    value: "",
  },
  company: {
    value: "",
  },
  message: {
    value: "",
  }
}

type FieldName = keyof typeof INITIAL_STATE;
type State = Record<FieldName, Field>;


interface FieldProps {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void;
  errorMessage?: string;
  rows?: number;
}

const InputField: React.FC<FieldProps> = props => {
  return <div>
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={props.id}>
      {props.label}
    </label>
    {props.rows && props.rows > 1 ?
      <textarea
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
        id={props.id}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
        rows={props.rows}
      /> :
      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id={props.id}
        type="text"
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
      />
    }

    {props.errorMessage && (
      <p className="text-red-500 text-xs italic">{props.errorMessage}</p>
    )}
  </div>
}

function validateField(field: FieldName, value: string): string | undefined {
  if (!value) {
    return "Required field"
  }

  switch (field) {
    case "email":
      if (!(/^([\w-\.\+]+)@((?:[\w-]+\.)+)([a-zA-Z]{2,4})$/).test(value)) {
        return "Invalid email"
      }

      // if (!/\w+@\w+\.\w+/.test(value)) {
      //   return "Invalid email"
      // }
      break;
  }

  return
}

const App = () => {
  const [state, setState] = useState<State>(INITIAL_STATE as State);


  const isFormInvalid = useMemo(() => {
    return Object.values(state).some(x => Boolean(x.errorMessage) || !x.value.length)
  }, [state])


  const setField = (fieldName: FieldName, field: Field) => {
    setState(prev => ({ ...prev, [fieldName]: ({ ...prev[fieldName], ...field }) }))
  }

  const handleFieldUpdate = useCallback((fieldName: FieldName) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;

    const errorMessage = validateField(fieldName, value);

    setField(fieldName, { value, errorMessage });
  }, []);

  const handleSubmit = useCallback(async (e: any) => {
    e.preventDefault();



    const data = Object.entries(state).reduce((acc, [k, v]) => ({
      ...acc,
      [k]: v.value
    }), {})

    await postData(`${API_ENDPOINT}/contacts`, data);
  }, [state]);



  return (
    <div className="w-full max-w-xl m-auto">
      <h1 className="mt-8 mb-4 font-bold text-2xl">Contact</h1>

      <p className="mb-6">
        Would you like to chat about Cloud Economics, a thorny AWS problem, or
        something else?
      </p>

      <form
        id="contact-form"
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-6">
          <InputField
            label="Your Email Address*"
            id="email"
            placeholder="horrifyingbills@duckbillgroup.com"
            value={state.email.value}
            errorMessage={state.email.errorMessage}
            onChange={handleFieldUpdate("email")}
          />
        </div>

        <div className="mb-6">
          <InputField
            label="Your Name*"
            id="name"
            placeholder="Billie the Platypus"
            value={state.name.value}
            errorMessage={state.name.errorMessage}
            onChange={handleFieldUpdate("name")}
          />
        </div>

        <div className="mb-6">
          <InputField
            label="Your Company*"
            id="company"
            placeholder="The Duckbill Group"
            onChange={handleFieldUpdate("company")}
            value={state.company.value}
            errorMessage={state.company.errorMessage}
          />
        </div>

        <div className="mb-6">
          <InputField
            id="message"
            label="What would you like to talk about?*"
            placeholder="What kind of mammal lays eggs?!"
            rows={10}
            value={state.message.value}
            errorMessage={state.message.errorMessage}
            onChange={handleFieldUpdate("message")}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className={isFormInvalid
              ? "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
            onClick={handleSubmit}
            disabled={isFormInvalid}
          >
            Submit
          </button>
        </div>
      </form>
      <p className="text-center text-gray-500 text-xs">
        &copy;2020 AWS Serverless Workshop. All rights reserved.
      </p>
    </div>
  );
}

export default App;
