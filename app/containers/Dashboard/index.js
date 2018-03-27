import React, { Component } from 'react';
import firebase, { auth, provider, facebookProvider } from '../../utils/firebase';

class Dashboard extends Component {

  constructor() {
    super();
    this.state = {
      currentItem: '',
      username: '',
      items: [],
      user: null,
      login: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.login = this.login.bind(this);
    this.facebookLogin = this.facebookLogin.bind(this);
    this.logout = this.logout.bind(this);
    this.oauth2SignIn = this.oauth2SignIn.bind(this);
    this.exchangeOAuth2Token = this.exchangeOAuth2Token.bind(this);
    this.trySampleRequest = this.trySampleRequest.bind(this);
  }

  componentDidMount() {


    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      }
    });
    const itemsRef = firebase.database().ref('items');
    itemsRef.on('value', (snapshot) => {
      let items = snapshot.val();
      let newState = [];
      for (let item in items) {
        newState.push({
          id: item,
          title: items[item].title,
          user: items[item].user
        });
      }
      this.setState({
        items: newState
      });
    });
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const itemsRef = firebase.database().ref('items');
    const item = {
      title: this.state.currentItem,
      user: this.state.user.displayName || this.state.user.email
    }
    // const item = {
    //   title: this.state.currentItem,
    //   user: this.state.username
    // }
    itemsRef.push(item);
    this.setState({
      currentItem: '',
      username: ''
    });
  }

  removeItem(itemId) {
    const itemRef = firebase.database().ref(`/items/${itemId}`);
    itemRef.remove();
  }

  logout() {
    console.log("auth ", auth);
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }

  login() {
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        this.setState({
          user
        });
      });
  }

  facebookLogin() {
    auth.signInWithPopup(facebookProvider)
      .then((result) => {
        const user = result.user;
        this.setState({
          user
        });
      });
  }


  // async facebookLogin() {
  //   const result = await auth().signInWithPopup(facebookProvider)
  //   this.setState({ user: result.user });
  // }

  // If there's an access token, try an API request.
  // Otherwise, start OAuth 2.0 flow.
  trySampleRequest() {
    // this.setState({login: true})
    let _ = this;
    var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
    if (params && params['access_token']) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET',
        'https://www.googleapis.com/drive/v3/about?fields=user&' +
        'access_token=' + params['access_token']);
      xhr.onreadystatechange = function (e) {
        if (xhr.response){
          let data = JSON.parse(xhr.response);
 console.log("data ", data);
          // _.setState({ user: data.user})
        }
      };
      xhr.send(null);
    } else {
      console.log("this ", this);

      this.oauth2SignIn();
    }
  }

  /*
   * Create form to request access token from Google's OAuth 2.0 server.
   */
  oauth2SignIn() {
    console.log("oauth2SignIn ");
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create element to open OAuth 2.0 endpoint in new window.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var params = {
      'client_id': '1020658543629-lv9i5dpgum36qge6udja2e8on2kpbeb7.apps.googleusercontent.com',
      'redirect_uri': 'http://localhost:4000',
      'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly',
      'state': 'try_sample_request',
      'include_granted_scopes': 'true',
      'response_type': 'token'
    };

    // Add form parameters as hidden input values.
    for (var p in params) {
      var input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  }

  /* Verify the access token received on the query string. */
  exchangeOAuth2Token(params) {
    let _ = this;
    console.log(" exchangeOAuth2Token params ", params);
    var oauth2Endpoint = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
    if (params['access_token']) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', oauth2Endpoint + '?access_token=' + params['access_token']);
      xhr.onreadystatechange = function (e) {
        if (xhr.response)
          var response = JSON.parse(xhr.response);
        console.log("response ", response);
        // When request is finished, verify that the 'aud' property in the
        // response matches YOUR_CLIENT_ID.
        if (xhr.readyState == 4 &&
          xhr.status == 200 &&
          response['aud'] &&
          response['aud'] == '1020658543629-lv9i5dpgum36qge6udja2e8on2kpbeb7.apps.googleusercontent.com') {
          // Store granted scopes in local storage to facilitate
          // incremental authorization.
          params['scope'] = response['scope'];
          localStorage.setItem('oauth2-test-params', JSON.stringify(params));
          if (params['state'] == 'try_sample_request') {
            _.trySampleRequest();
          }
        } else if (xhr.readyState == 4) {
          console.log('There was an error processing the token, another ' +
            'response was returned, or the token was invalid.')
        }
      };
      xhr.send(null);
    }
  }

  render() {
    // console.log("user", this.state.user)
    // var YOUR_CLIENT_ID = '1020658543629-lv9i5dpgum36qge6udja2e8on2kpbeb7.apps.googleusercontent.com';
    // var YOUR_REDIRECT_URI = 'http://localhost:4000';
    // var queryString = location.hash.substring(1);

    // // Parse query string to see if page request is coming from OAuth 2.0 server.
    // var params = {};
    // var regex = /([^&=]+)=([^&]*)/g, m;
    // while (m = regex.exec(queryString)) {
    //   params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    //   // Try to exchange the param values for an access token.
    //   this.exchangeOAuth2Token(params);
    //   }
    return (
      <div className='app'>
        <header>
          <div className="wrapper">
            <h1>Fun Food Friends</h1>
            {this.state.user ?
              <button onClick={this.logout}>Log Out</button>
              : <div>
                <button className="m-r-10" onClick={this.login}>
                {/* <button className="m-r-10" onClick={this.trySampleRequest}> */}
                  <i className="fa fa-google p-r-10" />
                  Log In</button>
                <button className="m-r-10" onClick={this.facebookLogin}>
                  <i className="fa fa-facebook p-r-10" />
                  Log In</button>
              </div>
            }
          </div>
        </header>
        {this.state.user ?
          <div>
            <div className='user-profile'>
              <img src={this.state.user.photoURL} />
            </div>
            <div className='container'>
              <section className='add-item'>
                <form onSubmit={this.handleSubmit}>
                  <input type="text" name="username" placeholder="What's your name?" defaultValue={this.state.user.displayName || this.state.user.email} />
                  <input type="text" name="currentItem" placeholder="What are you bringing?" onChange={this.handleChange} value={this.state.currentItem} />
                  <button>Add Item</button>
                </form>
              </section>
              <section className='display-item'>
                <div className="wrapper">
                  <ul>
                    {this.state.items.map((item) => {
                      return (
                        <li key={item.id}>
                          <h3>{item.title}</h3>
                          <p>brought by: {item.user}
                            {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                              <button onClick={() => this.removeItem(item.id)}>Remove Item</button> : null}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </section>
            </div>
          </div>
          :
          <div className='wrapper'>
            <p>You must be logged in to see the potluck list and submit to it.</p>
          </div>
        }


        {/* <div className='container'>

          <section className='add-item'>
            <form onSubmit={this.handleSubmit}>
              <input type="text" name="username" placeholder="What's your name?" onChange={this.handleChange} value={this.state.username} />
              <input type="text" name="currentItem" placeholder="What are you bringing?" onChange={this.handleChange} value={this.state.currentItem} />
              <button>Add Item</button>
            </form>
          </section>
          <section className='display-item'>
            <div className="wrapper">
              <ul>
                {this.state.items.map((item) => {
                  return (
                    <li key={item.id}>
                      <h3>{item.title}</h3>
                      <p>brought by: <strong>{item.user}</strong>
                        <button onClick={() => this.removeItem(item.id)}>Remove Item</button>
                      </p>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        </div> */}
      </div>
    );
  }
}

export default Dashboard;
