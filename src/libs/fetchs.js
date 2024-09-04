import Cookies from 'js-cookie';
import { ErrorCodes } from 'vue';

// Path URL
const url = import.meta.env.VITE_BASE_URL;


function getAuthToken() {
  return Cookies.get('token'); // Assuming the token is stored under 'token'

}

// GetData
async function getData(path) {
  try {
    // const res = await fetch(`http://ip23nw3.sit.kmutt.ac.th:8080/v2/${path}`)
    const res = await fetch(`${url}/v2/${path}`);

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function removeById(path, id) {
  try {
    const res = await fetch(`${url}/v2/${path}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      if (res.status === 404) {
        // Handle 404 error
        return res;
      } else {
        throw new Error('Failed to delete task');
      }
    }
    console.log('Task deleted successfully');
    return res;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

async function editData(path, taskId, data) {
  try {
    const response = await fetch(`${url}/v2/${path}/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
    const result = await response.json();
    console.log('Success:', result);
    return result;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function removeAndTransfer(path, removeId, transferId) {
  try {
    const res = await fetch(`${url}/v2/${path}/${removeId}/${transferId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      if (res.status === 404) {
        // Handle 404 error
        return res;
      } else {
        throw new Error('Failed to delete task');
      }
    }
    console.log('Status removed and tasks transferred successfully');
    return res;
  } catch (error) {
    console.error('Error removing status and transferring tasks:', error);
    throw error;
  }
}

async function login(username, password) {
  const res = await fetch(`${url}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userName: username,
      password: password,
    }),
  });

  if (res.ok) {
    const result = await res.text();
    console.log('Login successful:', result);
    return result;
  } else {
    console.log('Error during login:', res.statusText);
    return null;
  }
}

async function getBoard(path) {
  try {
    // const res = await fetch(`http://ip23nw3.sit.kmutt.ac.th:8080/v2/${path}`)
    const res = await fetch(`${url}/v3/${path}`);

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}


async function getTaskByBoard(path) {
  console.log(url,path);
  
  try {
    const res = await fetch(`${url}/v3/boards/${path}`);
   
    
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await res.json(); 
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function createStatus(data, path){
  try {
    const response = await fetch(`${url}/v3/boards/${path}`, {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log('Success:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }

}

async function addData(data, path) {
  try {
    const response = await fetch(`${url}/v3/boards/${path}`, {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },

      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log('Success:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// async function editStatus(status_ID, data) {
//   try {
//     const response = await fetch(
//       `${url}/v2/statuses/${status_ID}`,
//       {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       }
//     )

//     if (!response.ok) {
//       const errorMessage = await response.text()
//       throw new Error(errorMessage)
//     }
//     const result = await response.json()
//     console.log('Success:', result)
//     return result
//   } catch (error) {
//     console.error('Error:', error.message)
//     throw error
//   }
// }

// async function addStatus(path, data) {
//   try {
//     const response = await fetch(
//       `${url}/v2/${path}`,
//       {
//         method: 'POST', // or 'PUT'
//         headers: {
//           'Content-Type': 'application/json',
//         },

//         body: JSON.stringify(data),
//       }
//     )
//     console.log(data)
//     const result = await response.json()
//     console.log('Success:', result)
//     return result
//   } catch (error) {
//     console.error('Error:', error)
//   }
// }

export { getData, removeById, addData, editData, removeAndTransfer, login ,getBoard ,getTaskByBoard, createStatus};
