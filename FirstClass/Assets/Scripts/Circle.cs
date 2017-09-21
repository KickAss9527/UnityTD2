using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Circle : MonoBehaviour {

	// Use this for initialization
	void Start () {

	}
	
	// Update is called once per frame
	void Update () {
		
	}

	public void setupScale(float s)
	{
		this.transform.localScale = new Vector3 (s, 1, s);
		MeshRenderer mr = this.gameObject.GetComponent<MeshRenderer> ();
		Material ma = mr.material;
		ma.SetFloat ("_Scale", 1 / transform.localScale.x);
	}
}
