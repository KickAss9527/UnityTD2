using UnityEngine;  
using System.Collections;
using System.IO;
using UnityEngine.UI;
using System.Net.Sockets;
using System.Net;  
using System.Text;
using System.Threading;
using System;

public class ServerMsg
{
	public int exec;
	public string uid;
	public int start;
	public int end;
	public string[] team;
	public string userID;
	public string tower;
	public int tileIdx;
}

public class EnemyConfig
{
	public string name;
	public int health;
	public int speed;
}

public class Server : Singleton<Server>  {

	// Use this for initialization

//	private void SocketOpened(object sender, MessageEventArgs e) {
//		//invoke when socket opened
//		Debug.Log ("open");
//	}
	enum Exec{
		Enter = 1000,
		Ready = 1001,
		Build = 1002,
		UpdatePath = 1003,
		Deconstruct = 1004,
		MultipleGameReady = 1005,
		End = 2000
	};
	private string tmpMsg;
	private Socket clientSocket;
	private string strPlayerID;

	void ReceiveSocket()  
	{  
		//在这个线程中接受服务器返回的数据  
		while (true)  
		{   
			if(!clientSocket.Connected)  
			{  
				//与服务器断开连接跳出循环  
				Debug.Log("Failed to clientSocket server.");  
				clientSocket.Close();  
				break;  
			}  
			try  
			{  
				//接受数据保存至bytes当中  
				byte[] bytes = new byte[4096];  
				//Receive方法中会一直等待服务端回发消息  
				//如果没有回发会一直在这里等着。  
				int i = clientSocket.Receive(bytes);  
				if(i <= 0)  
				{  
					clientSocket.Close();  
					break;  
				}     
				UTF8Encoding enc = new UTF8Encoding();
				string msg = enc.GetString(bytes);
				recvMsg(msg);
			}  
			catch (Exception e)  
			{  
				Debug.Log("Failed to clientSocket error." + e);  
				clientSocket.Close();  
				break;  
			}  
		}  
	}     
	string getExecStr(Exec en)
	{
		int v = (int)en;
		return v.ToString ();
	}
	public void launch () 
	{
		clientSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
		IPAddress mIp = IPAddress.Parse("192.168.1.103");  
//		IPAddress mIp = IPAddress.Parse("192.168.1.74");  
		IPEndPoint ip_end_point = new IPEndPoint(mIp, 8888);  

		try {  
			clientSocket.Connect(ip_end_point);  
			Debug.Log("connect to server");

			Thread th = new Thread(new ThreadStart(ReceiveSocket));
			th.IsBackground = true;
			th.Start();
			sendMsg("{\"exec\" : " + getExecStr(Exec.Enter) + "}");


		}
		catch{ Debug.Log ("coonect failed");}

	}

	private void recvMsg(string msg)
	{
		Debug.Log (msg);
		this.tmpMsg = msg;

	}

	private void sendMsg(string msg)
	{
		UTF8Encoding enc = new UTF8Encoding ();
		this.clientSocket.Send (enc.GetBytes (msg));
	}

	public void sendReady()
	{
		sendMsg ("{\"exec\" : " + getExecStr(Exec.Ready) + "}");
	}
	public void sendMultipleReady(){
		sendMsg ("{\"exec\" : " + getExecStr(Exec.MultipleGameReady) + "}");
	}
	public void sendBuilding(int tileIdx, string tType)
	{
		string msg = "{\"exec\" : " + getExecStr(Exec.Build) + ",";
		msg += "\"userID\" :\"" + strPlayerID + "\",";
		msg += "\"tower\" :\"" + tType + "\",";
		msg += "\"tileIdx\" : " + tileIdx.ToString() + "}";
		sendMsg (msg);
	}
	public void sendDeconstructBuilding(int tileIdx){
		string msg = "{\"exec\" : " + getExecStr(Exec.Deconstruct) + ",";
		msg += "\"userID\" :\"" + strPlayerID + "\",";
		msg += "\"tileIdx\" : " + tileIdx.ToString() + "}";
		sendMsg (msg);
	}

	// Update is called once per frame
	void Update () {
		if (this.tmpMsg == null)
			return;
		ServerMsg data = JsonUtility.FromJson<ServerMsg> (this.tmpMsg);
		this.tmpMsg = null;
		switch ((Exec)data.exec) {
		case Exec.Enter:
			{
				this.strPlayerID = data.uid;
			}
			break;
		case Exec.Ready:
			{
				int start = data.start;
				int end = data.end;

//				GameManager.Instance.setupConfig (start, end);

				EnemyConfig enA = new EnemyConfig ();
				enA.name = "A";
				enA.speed = 14;
				enA.health = 100;

				EnemyConfig enB = new EnemyConfig ();
				enB.name = "B";
				enB.speed = 6;
				enB.health = 200;

				EnemyConfig[] enemyCon = { enA, enB };
	
//				GameManager.Instance.setupEnemyInfo (data.team, enemyCon);
			}
			break;
		
		case Exec.UpdatePath:
			{
				string userID = data.userID;
				if (userID != this.strPlayerID)
				{
//					GameManager.Instance.recieveBuildingInfo (data.tileIdx, data.tower);
				}

			}
			break;
		default:
			break;
		}
	}
}
