
import React, { Component } from 'react';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import {withRouter} from 'react-router'
import { render } from '@testing-library/react';
// import Exhibition from './components/Exhibition's
import MyTeam from './components/MyTeam'
import PlayerCard from './components/PlayerCard'
import TeamCard from './components/TeamCard'
import Players from './components/Players'
import LogIn from './components/LogIn'
import SignUp from './components/SignUp';
import Exhibition from './components/Exhibition';

export default class App extends Component {
  
  state = {
    allplayerdata: [],
    team: null,
    players:[],
    playerteams: [],
    username: "",
    user: null
  }   

  componentDidMount() {
    if(localStorage.token){
      fetch('http://localhost:3000/api/v1/get_user', {
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${localStorage.token}`
        }
      })
      .then(resp => resp.json())
      .then(user => {
        // console.log(user)
        this.setState({
          team: user.team.id,
          players: user.players,
          username: user.username,
          user: user
        })
        // console.log(this.state)
      })
       
    }

    fetch('http://localhost:3000/api/v1/players')
    .then(res=>res.json())
    .then(data=> {
      this.setState({
          allplayerdata: data
      })
    })
  } 

  generatePlayerCards = () => {
    if (this.state.allplayerdata) {
      return this.state.allplayerdata.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          team={this.state.team}
          addPlayer={this.addPlayer}
        />
      ));
    }
    console.log(this.state)
  };

  generateTeamCards = () => {
    if (this.state.team) {
      return this.state.players.map(player => (

        <TeamCard
          key={player.id}
          player={player}
          team={this.state.team}
          playerteams={this.state.playerteams}
          removePlayer={this.removePlayer}
        />
      ));
    }
  };

  addPlayer = (player, teamid) => {
    let playerIsOnTeam = () => {
      let teamplayer = this.state.players.filter(
        (p) => p.id === player.id
      );

      if (teamplayer.length > 0) {
        return true;
      } else {
        return false;
      }
    };

    if (this.state.players.length < 5) {
      if (playerIsOnTeam()) {
        alert("This player is already on your team");
      } else {
        let player_team_data = {
          player_id: player.id,
          team_id: teamid,
        };
        fetch("http://localhost:3000/api/v1/player_teams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(player_team_data),
        })
          .then((res) => res.json())
          .then((data) => 
            this.setState({
              players: [...this.state.players, player],
              playerteams: [...this.state.playerteams, data]
            })
          );  
      }
    } 
    else {
      alert("You already have 5 players on your team");
    }
  };

  removePlayer = (playerid, playerteamid) => {
    fetch(`http://localhost:3000/api/v1/player_teams/${playerteamid}`, {
          method: "DELETE",
    })
      .then((res) => res.json())
    let updatedPlayers = [...this.state.players].filter(player => player.id !== playerid)
    this.setState({players: updatedPlayers})
  }

  handleUsername = (username) => {
    
    // console.log(e.target.name)
    this.setState({
      username: username
    })
    console.log(this.state.username)
  }



  render() {
    return (
      <BrowserRouter>
        <div>

          <Route exact path="/" render={(routeProps) => <LogIn {...routeProps} logIn={this.logIn} handleUsername={this.handleUsername} />} />
          <Route exact path="/signup" render={(routeProps) => <SignUp {...routeProps} signUp={this.signUp} handleUsername={this.handleUsername} username={this.state.username} />} />
          <Route path= "/players" render={(props) => (<Players {...props} generatePlayerCards={this.generatePlayerCards} addPlayer={this.addPlayer} isAuthed={true} username={this.state.username} />)} />
          <Route path= "/myteam" render={(props) => (<MyTeam {...props} generateTeamCards={this.generateTeamCards} removePlayer={this.removePlayer} isAuthed={true} username={this.state.username} />)} />
          <Route path= "/exhibition" render={(props) => (<Exhibition {...props} username={this.state.username} generateTeamCards={this.generateTeamCards} players={this.state.players}logOut={this.props.logOut} />)}/>

        </div>
      </BrowserRouter>
    );
  }
}
