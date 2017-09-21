using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using DG.Tweening;
public class CameraController : MonoBehaviour {

	Vector3 rotateAxis = Vector3.zero;
	int direction = 0;
	float curAng = 0;
	float speed = 24f;
	int angle = 90;
	RangeInt fields = new RangeInt(12, 30);

	private Vector3 _vec3TargetScreenSpace;// 目标物体的屏幕空间坐标  
	private Vector3 _vec3TargetWorldSpace;// 目标物体的世界空间坐标  
	private Transform _trans;// 目标物体的空间变换组件  
	private Vector3 _vec3MouseScreenSpace;// 鼠标的屏幕空间坐标  
	private Vector3 _vec3Offset;// 偏移  

	// Use this for initialization
	void Start () {
		_trans = transform;
	}
	void OnMouseDown( )   

	{   

		// 把目标物体的世界空间坐标转换到它自身的屏幕空间坐标   

		_vec3TargetScreenSpace = Camera.main.WorldToScreenPoint(_trans.position);  

		// 存储鼠标的屏幕空间坐标（Z值使用目标物体的屏幕空间坐标）   

		_vec3MouseScreenSpace = new Vector3(Input.mousePosition.x, Input.mousePosition.y, _vec3TargetScreenSpace.z);  

		// 计算目标物体与鼠标物体在世界空间中的偏移量   

		_vec3Offset = _trans.position - Camera.main.ScreenToWorldPoint(_vec3MouseScreenSpace);  

		// 鼠标左键按下   

		if ( Input.GetMouseButton(0) ) {  
			Debug.Log ("sdf");
			// 存储鼠标的屏幕空间坐标（Z值使用目标物体的屏幕空间坐标）  

			_vec3MouseScreenSpace = new Vector3(Input.mousePosition.x, Input.mousePosition.y, _vec3TargetScreenSpace.z);  

			// 把鼠标的屏幕空间坐标转换到世界空间坐标（Z值使用目标物体的屏幕空间坐标），加上偏移量，以此作为目标物体的世界空间坐标  

			_vec3TargetWorldSpace = Camera.main.ScreenToWorldPoint(_vec3MouseScreenSpace) + _vec3Offset;                

			// 更新目标物体的世界空间坐标   

			_trans.position = _vec3TargetWorldSpace;  
			transform.position = _trans.position;
			// 等待固定更新   

//			yield return new WaitForFixedUpdate();  
		}   
	}  
	// Update is called once per frame
	void Update () {

		//StartCoroutine (OnMouseDown());
//		OnMouseDown();
		if (Input.GetMouseButton (0)) 
		{
			if (_vec3MouseScreenSpace == Vector3.zero) {
				_vec3MouseScreenSpace = new Vector3 (Input.mousePosition.x, Input.mousePosition.y, 100);
			} 
			else 
			{
				Vector3 screenPos = new Vector3 (Input.mousePosition.x, Input.mousePosition.y, 100);
				Vector3 offset = Camera.main.ScreenToWorldPoint (_vec3MouseScreenSpace) - Camera.main.ScreenToWorldPoint (screenPos);
				Debug.Log (screenPos);
				Debug.Log (Camera.main.ScreenToWorldPoint (screenPos));
				Debug.Log ("----------");
				offset.y = 0;
				transform.position += offset;
				_vec3MouseScreenSpace = screenPos;
			}
		}
		else if(_vec3MouseScreenSpace != Vector3.zero)
		{
			_vec3MouseScreenSpace = Vector3.zero;
		}
		if (rotateAxis != Vector3.zero) {
			curAng += speed;
			Debug.Log (curAng);
			if (curAng >= angle) {
				transform.RotateAround (rotateAxis, Vector3.up, (speed - (curAng - angle))*direction);
				rotateAxis = Vector3.zero;
				curAng = 0;
				return;
			}
			transform.RotateAround (rotateAxis, Vector3.up,  speed*direction);
		}

		//zoom out
		if (Input.GetAxis ("Mouse ScrollWheel") < 0) 
		{
			Camera.main.fieldOfView = Mathf.Clamp (Camera.main.fieldOfView + 2, fields.start, fields.end);
		}

		if (Input.GetAxis ("Mouse ScrollWheel") > 0) {
			Camera.main.fieldOfView = Mathf.Clamp (Camera.main.fieldOfView - 2, fields.start, fields.end);
		}
	}

	public void evtLeft()
	{
		Ray ray = Camera.main.ScreenPointToRay (new Vector3 (Screen.width / 2, Screen.height / 2, 0));
		RaycastHit hit;
		if (Physics.Raycast (ray, out hit, 99999.8f, LayerMask.GetMask ("Ground"))) {
			this.rotateAxis = hit.point;
			direction = 1;
		}
	}
	public void evtRight()
	{
		Ray ray = Camera.main.ScreenPointToRay (new Vector3 (Screen.width / 2, Screen.height / 2, 0));
		RaycastHit hit;
		if (Physics.Raycast (ray,out hit, 99999f, LayerMask.GetMask ("Ground"))) {
			this.rotateAxis = hit.point;
			direction = -1;
		}
	}
}
