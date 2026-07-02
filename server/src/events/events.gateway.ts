import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`WS client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`WS client disconnected: ${client.id}`);
  }

  emitNewContact(contact: any) {
    this.server.emit('new_contact', contact);
  }
}
