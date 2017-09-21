using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FingerGes : MonoBehaviour {

	// Use this for initialization
	void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {
		
	}

	void OnDrag( DragGesture gesture )
	{
		Debug.Log (gesture.DeltaMove);
	}
}
