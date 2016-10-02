# voting-app

`voting-app` is a no-frills, generic web app that allows users to create polls,
vote on others' polls, and see results in bar chart form.  Created per specs
at [FreeCodeCamp].

#### Features

- Authenticated users can create polls with unlimited options.
- Authenticated users can add options to other users' polls.
- Authenticated and unauthenticated users can vote on any poll.
- User votes are recorded on the server as well as locally in session data
to minimize multiple votes per user on the same poll.
- Polls are displayed in charts powered by [d3.js].
- Users can share their polls on Facebook and Twitter.

#### Tech

`voting-app` is powered by a Node.js/Express/MongoDB stack.  It utilizes
[Mongoose] for DB interaction and [Passport] for authentication.

#### License

Copyright 2016 by Shane Hughes. `voting-app` is free software; you can
redistribute it and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation; either version 2 of
the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
more details.

A copy of the GPLv2 can be found in the file `COPYING`.

[FreeCodeCamp]: <https://www.freecodecamp.com/challenges/build-a-voting-app>
[Mongoose]: <http://mongoosejs.com/index.html>
[Passport]: <http://passportjs.org/>
[d3.js]: <https://d3js.org/>