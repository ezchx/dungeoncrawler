// initialize variables
var elements = [];
var width = 50;
var height = 30;
var weaponEnemyArr = ["Poison", "Claws/Teeth", "Sword"];
var weaponYouArr = ["Club", "Lance", "Sword"];

// format individual boxes
var Box = React.createClass({
  
  render: function() {
    if (this.props.param === 1) {  // player
      return (<div id={"box" + this.props.count} className="boxyBlue">&nbsp;</div>);
    } else if (this.props.param === 2) { // enemy
      return (<div id={"box" + this.props.count} className="boxyRed">&nbsp;</div>);
    } else if (this.props.param === 3) { // weapon
      return (<div id={"box" + this.props.count} className="boxyYellow">&nbsp;</div>);
    } else if (this.props.param === 4) { // health
      return (<div id={"box" + this.props.count} className="boxyGreen">&nbsp;</div>);
    } else if (this.props.param === 5) { // maze
      return (<div id={"box" + this.props.count} className="boxyGrey">&nbsp;</div>);
    } else {
      return (<div id={"box" + this.props.count} className="boxyBlack">&nbsp;</div>);
    }
  }
});


// display matrix
var DungeonMatrix = React.createClass({
  
 render: function() {
   var playerPos = this.props.elements.indexOf(1);
    var count = -1;
    var components = this.props.elements.map(function(b) {
      count += 1;
      if(document.getElementById('windy').checked) {
        var leftSide = Math.min((1 + playerPos % width), 5);
        var rightSide = Math.min((width - playerPos % width), 5);
        if (
          (((playerPos - count) < leftSide) && ((count - playerPos) < rightSide)) ||
          (((playerPos - count + width) < leftSide) && ((count - playerPos - width) < rightSide)) ||
          (((playerPos - count - width) < leftSide) && ((count - playerPos + width) < rightSide)) ||
          (((playerPos - count + width*2) < leftSide) && ((count - playerPos - width*2) < rightSide)) ||
          (((playerPos - count - width*2) < leftSide) && ((count - playerPos + width*2) < rightSide)) ||
          (((playerPos - count + width*3) < leftSide) && ((count - playerPos - width*3) < rightSide)) ||
          (((playerPos - count - width*3) < leftSide) && ((count - playerPos + width*3) < rightSide))
          )
        {
          return <Box param={b} count={count} elements={elements}/>;
        } else {
          return <div id={"box" + count} className="boxyWhite">&nbsp;</div>;
        }
      } else {
        return <Box param={b} count={count} elements={elements}/>;
      }
    });
    
    // group into chunks equal to width
    var groups = [];
    var children = [];
    while(components.length > 0) {
      children.push(components.shift());
      if (children.length === width) {
        groups.push(<div className="oneRow">{children}</div>);
        children = [];
      }
    }

    return (
      <div className="dungeonMatrix">
        {groups}
      </div>
    );
  }
});


// main box
var DungeonBox = React.createClass({
  
  loadMazeFromServer: function(level) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        var i = 0;
        while (i < 5) {
          var rndPos = Math.floor(Math.random() * (height*width));
          if (data[level-1][rndPos] === 0 && i === 4) {data[level-1][rndPos] = 4; i = 5};
          if (data[level-1][rndPos] === 0 && i === 3) {data[level-1][rndPos] = 4; i = 4};
          if (data[level-1][rndPos] === 0 && i === 2) {data[level-1][rndPos] = 4; i = 3};
          if (data[level-1][rndPos] === 0 && i === 1) {data[level-1][rndPos] = 3; i = 2};
          if (data[level-1][rndPos] === 0 && i === 0) {data[level-1][rndPos] = 2; i = 1};
        }
        this.setState({healthYou: 100});
        this.setState({healthEnemy: 100});
        document.addEventListener("keydown", this.movePlayer, false);
        this.setState({elements: data[level-1]});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
    var enemyArr = ["Snake", "Dragon", "Big Boss"];
    var weaponEnemyArr = ["Poison", "Fire", "Sword"];
    $("#levelLine").html("Level: " + level);
    clearInterval(this._timer);
    if ($("#butty").is(":focus") || level > 1) {this.delayTimer(level);}
    this.setState({weaponYou: "None"});
    this.setState({enemy: enemyArr[(level-1)]});
    this.setState({weaponEnemy: weaponEnemyArr[(level-1)]});
  },  
  
  getInitialState: function() {
    return {elements: [], health: 100, weapon: "None"};
  },
  
  componentDidMount: function() {
    var level = 1
    this.setState({level: level});
    this.loadMazeFromServer((level));
    document.addEventListener("keydown", this.movePlayer, false);
    clearInterval(this._timer);
  },

  
  // move player
  movePlayer: function(event) {
    //$("#debug").html(event.keyCode);
    
    // move left
    if (event.keyCode === 100 || event.keyCode === 37) {
      var playerPos = this.state.elements.indexOf(1);
      if (this.state.elements[(playerPos-1)] === 2) {
        var damage = Math.floor(Math.random() * 10) + (this.state.level * 2);
        if (this.state.weaponYou !== "None") {damage += 10;}
        if (damage >= this.state.healthEnemy) {this.state.healthEnemy = 0} else {this.state.healthEnemy = this.state.healthEnemy - damage;}
        if (this.state.healthEnemy === 0) {
          document.removeEventListener("keydown", this.movePlayer, false);
          var level = this.state.level+1;
          if (level === 4) {
            this.state.elements[(playerPos-1)] = 0;
            $("#levelLine").html("You Win!!!");
            clearInterval(this._timer);
          } else {
            this.setState({level: level});
            this.loadMazeFromServer((level));
          }
        };
      }
      if (playerPos % width != 0 && this.state.elements[(playerPos-1)] !== 5 && this.state.elements[(playerPos-1)] !== 2) {
        this.state.elements[playerPos] = 0;
        if (this.state.elements[(playerPos-1)] === 4) {this.state.healthYou = this.state.healthYou + 20;}
        if (this.state.elements[(playerPos-1)] === 3) {this.state.weaponYou = weaponYouArr[this.state.level-1];}
        this.state.elements[(playerPos-1)] = 1;
      }
    }
    
    // move right
    if (event.keyCode === 102 || event.keyCode === 39) {
      var playerPos = this.state.elements.indexOf(1);
      if (this.state.elements[(playerPos+1)] === 2) {
        var damage = Math.floor(Math.random() * 10) + (this.state.level * 2);
        if (this.state.weaponYou !== "None") {damage += 10;}
        if (damage >= this.state.healthEnemy) {this.state.healthEnemy = 0} else {this.state.healthEnemy = this.state.healthEnemy - damage;}
        if (this.state.healthEnemy === 0) {
          document.removeEventListener("keydown", this.movePlayer, false);
          var level = this.state.level+1;
          if (level === 4) {
            this.state.elements[(playerPos+1)] = 0;
            $("#levelLine").html("You Win!!!");
            clearInterval(this._timer);
          } else {
            this.setState({level: level});
            this.loadMazeFromServer((level));
          }
        };
      }
      if ((playerPos+1) % width != 0 && this.state.elements[(playerPos+1)] !== 5 && this.state.elements[(playerPos+1)] !== 2) {
        this.state.elements[playerPos] = 0;
        if (this.state.elements[(playerPos+1)] === 4) {this.state.healthYou = this.state.healthYou + 20;}
        if (this.state.elements[(playerPos+1)] === 3) {this.state.weaponYou = weaponYouArr[this.state.level-1];}
        this.state.elements[(playerPos+1)] = 1;
      }
    }
    
    // move up
    if (event.keyCode === 104 || event.keyCode === 38) {
      var playerPos = this.state.elements.indexOf(1);
      if (this.state.elements[(playerPos-width)] === 2) {
        var damage = Math.floor(Math.random() * 10) + (this.state.level * 2);
        if (this.state.weaponYou !== "None") {damage += 10;}
        if (damage >= this.state.healthEnemy) {this.state.healthEnemy = 0} else {this.state.healthEnemy = this.state.healthEnemy - damage;}
        if (this.state.healthEnemy === 0) {
          document.removeEventListener("keydown", this.movePlayer, false);
          var level = this.state.level+1;
          if (level === 4) {
            this.state.elements[(playerPos-width)] = 0;
            $("#levelLine").html("You Win!!!");
            clearInterval(this._timer);
          } else {
            this.setState({level: level});
            this.loadMazeFromServer((level));
          }
        };
      }
      if (playerPos >= width && this.state.elements[(playerPos-width)] !== 5 && this.state.elements[(playerPos-width)] !== 2) {
        this.state.elements[playerPos] = 0;
        if (this.state.elements[(playerPos-width)] === 4) {this.state.healthYou = this.state.healthYou + 20;}
        if (this.state.elements[(playerPos-width)] === 3) {this.state.weaponYou = weaponYouArr[this.state.level-1];}        
        this.state.elements[(playerPos-width)] = 1;
      }
    }    
    
    // move down
    if (event.keyCode === 98 || event.keyCode === 40) {
      var playerPos = this.state.elements.indexOf(1);
      if (this.state.elements[(playerPos+width)] === 2) {
        var damage = Math.floor(Math.random() * 10) + (this.state.level * 2);
        if (this.state.weaponYou !== "None") {damage += 10;}
        if (damage >= this.state.healthEnemy) {this.state.healthEnemy = 0} else {this.state.healthEnemy = this.state.healthEnemy - damage;}
        if (this.state.healthEnemy === 0) {
          document.removeEventListener("keydown", this.movePlayer, false);
          var level = this.state.level+1;
          if (level === 4) {
            this.state.elements[(playerPos+width)] = 0;
            $("#levelLine").html("You Win!!!");
            clearInterval(this._timer);
            document.removeEventListener("keydown", this.movePlayer, false);
          } else {
            this.setState({level: level});
            this.loadMazeFromServer((level));
          }
        };
      }
      if (playerPos < (height*width)-width && this.state.elements[(playerPos+width)] !== 5 && this.state.elements[(playerPos+width)] !== 2) {
        this.state.elements[playerPos] = 0;
        if (this.state.elements[(playerPos+width)] === 4) {this.state.healthYou = this.state.healthYou + 20;}
        if (this.state.elements[(playerPos+width)] === 3) {this.state.weaponYou = weaponYouArr[this.state.level-1];}        
        this.state.elements[(playerPos+width)] = 1;
      }
    }
    this.setState({elements: this.state.elements});
    this.setState({healthYou: this.state.healthYou});    
  },

  delayTimer: function(level) {
    var self = this;
    //$("#debug").html(level);
    var interval = (600/level);
    setTimeout(function() {
      if (!self.isMounted()) { return; } // abandon 
      self.moveEnemy(); // do it once and then start it up ...
      self._timer = setInterval(self.moveEnemy.bind(self), interval);
    });
  },    
  
  moveEnemy: function() {
    var enemyPos = this.state.elements.indexOf(2);
    var enemyMove = Math.floor(Math.random() * 4);
    
    //move left
    if (enemyMove === 0) {
      if (this.state.elements[(enemyPos-1)] === 1) {
        var damage = Math.floor(Math.random() * 10) + 15 + (this.state.level * 4);
        if (damage >= this.state.healthYou) {this.state.healthYou = 0} else {this.state.healthYou = this.state.healthYou - damage;}
        if (this.state.healthYou === 0) {
          this.state.elements[(enemyPos-1)] = 0;
          $("#levelLine").html("You are Dead");
          document.removeEventListener("keydown", this.movePlayer, false);
        }
      }
      if (enemyPos % width != 0 && this.state.elements[(enemyPos-1)] !== 5 && this.state.elements[(enemyPos-1)] !== 1) {
        this.state.elements[enemyPos] = 0;
        this.state.elements[(enemyPos-1)] = 2;
      }
    }
    
    // move right
    if (enemyMove === 1) {
      if (this.state.elements[(enemyPos+1)] === 1) {
        var damage = Math.floor(Math.random() * 10) + 15 + (this.state.level * 4);
        if (damage >= this.state.healthYou) {this.state.healthYou = 0} else {this.state.healthYou = this.state.healthYou - damage;}
        if (this.state.healthYou === 0) {
          this.state.elements[(enemyPos+1)] = 0;
          $("#levelLine").html("You are Dead");
          document.removeEventListener("keydown", this.movePlayer, false);          
        }
      }
      if ((enemyPos+1) % width != 0 && this.state.elements[(enemyPos+1)] !== 5 && this.state.elements[(enemyPos+1)] !== 1) {
        this.state.elements[enemyPos] = 0;
        this.state.elements[(enemyPos+1)] = 2;
      }
    }
    
    // move up
    if (enemyMove === 2) {
      if (this.state.elements[(enemyPos-width)] === 1) {
        var damage = Math.floor(Math.random() * 10) + 15 + (this.state.level * 4);
        if (damage >= this.state.healthYou) {this.state.healthYou = 0} else {this.state.healthYou = this.state.healthYou - damage;}
        if (this.state.healthYou === 0) {
          this.state.elements[(enemyPos-width)] = 0;
          $("#levelLine").html("You are Dead");
          document.removeEventListener("keydown", this.movePlayer, false);
        }
      }
      if (enemyPos >= width && this.state.elements[(enemyPos-width)] !== 5 && this.state.elements[(enemyPos-width)] !== 1) {
        this.state.elements[enemyPos] = 0;
        this.state.elements[(enemyPos-width)] = 2;
      }
    }
    
    // move down
    if (enemyMove === 3) {
      if (this.state.elements[(enemyPos+width)] === 1) {
        var damage = Math.floor(Math.random() * 10) + 15 + (this.state.level * 4);
        if (damage >= this.state.healthYou) {this.state.healthYou = 0} else {this.state.healthYou = this.state.healthYou - damage;}
        if (this.state.healthYou === 0) {
          this.state.elements[(enemyPos+width)] = 0;
          $("#levelLine").html("You are Dead");
          document.removeEventListener("keydown", this.movePlayer, false);          
        }        
      }
      if (enemyPos < (height*width)-width && this.state.elements[(enemyPos+width)] !== 5 && this.state.elements[(enemyPos+width)] !== 1) {
        this.state.elements[enemyPos] = 0;
        this.state.elements[(enemyPos+width)] = 2;
      }
    }
    this.setState({elements: this.state.elements});
  },

  
  render: function() {
    return (
      <div tabindex="0" className="dungeonBox" id="theBox">
        <h1>Dungeon Crawler</h1>
        <h2 id="levelLine"></h2>
        <div className="titleBox">
          <h3><div className="boxyBlue alignMid1">&nbsp;</div><b> Player</b></h3>
          <h3>Health: {this.state.healthYou}</h3>
          <h3>Weapon: {this.state.weaponYou}</h3>
        </div>
        <div className="titleBox">
          <h3><div className="boxyRed alignMid1">&nbsp;</div><b> {this.state.enemy}</b></h3>         
          <h3>Health: {this.state.healthEnemy}</h3>
          <h3>Weapon: {this.state.weaponEnemy}</h3>
        </div>
        
        <div>
          <h4><input type="checkbox" id="windy" value="Window" /> Window</h4>
          <input type="button" id="butty" className="btn-sm btn-success button" onClick={this.componentDidMount.bind(this, elements)} value="Start" />
        </div>
        <DungeonMatrix elements={this.state.elements} />
        <h3>
          <div className="boxyGreen alignMid2"></div> Health
          <div className="boxyYellow alignMid2"></div> Weapon
          <div className="alignTop">&#8592; Left</div>
          <div className="alignTop">&#8594; Right</div>
          <div className="alignTop">&#8593; Up</div>
          <div className="alignTop">&#8595; Down</div>
        </h3>
      </div>
    );
  }
});


// render components!
ReactDOM.render(
  <DungeonBox url="http://ezchx.com/jsonmaker/dungeoncrawler.php" />,
  document.getElementById('content')
);

