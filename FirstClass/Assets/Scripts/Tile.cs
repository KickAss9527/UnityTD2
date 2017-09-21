using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
public class Tile : MonoBehaviour {

	public Tower objTower;
	// Use this for initialization
	void Start () {
		MeshRenderer mr = this.GetComponent<MeshRenderer> ();
		Color col = Color.green;
		col.a = 0f;
		mr.material.color = col;
	}
	
	// Update is called once per frame
	void Update () {

	}
		
	public void evtSelect()
	{
		if (objTower) 
		{
			this.objTower.evtSelect ();
		} 
		else 
		{
			
			MeshRenderer mr = this.GetComponent<MeshRenderer> ();
			Color col = mr.material.color;
			col.a = 0.3f;
			mr.material.color = col;
		}
	}

	public void evtUnselect(){
		if (objTower) 
		{
			this.objTower.evtUnSelect ();
		} 

		MeshRenderer mr = this.GetComponent<MeshRenderer> ();
		Color col = mr.material.color;
		col.a = 0;
		mr.material.color = col;

	}

}
